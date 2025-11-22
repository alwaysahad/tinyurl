import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';
import { generateCode, isValidUrl, isValidCode } from '@/lib/utils';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDbInitialized();
    const body = await request.json();
    const { url, code: customCode } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    let code: string;
    if (customCode) {
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
      code = customCode;
    } else {
      let attempts = 0;
      do {
        code = generateCode(6);
        attempts++;
        if (attempts > 10) {
          return NextResponse.json(
            { error: 'Failed to generate unique code' },
            { status: 500 }
          );
        }
      } while (await codeExists(code));
    }

    if (await codeExists(code)) {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }

    const client = await pool.connect();
    try {
      const result = await client.query(
        'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
        [code, url]
      );
      return NextResponse.json(result.rows[0], { status: 201 });
    } catch (insertError: any) {
      if (insertError.code === '23505') {
        return NextResponse.json(
          { error: 'Code already exists' },
          { status: 409 }
        );
      }
      throw insertError;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDbInitialized();
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM links ORDER BY created_at DESC'
      );
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function codeExists(code: string): Promise<boolean> {
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT 1 FROM links WHERE code = $1 LIMIT 1',
      [code]
    );
    return result.rows.length > 0;
  } finally {
    client.release();
  }
}

