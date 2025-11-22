import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from '@/lib/db';

let dbInitialized = false;
async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await ensureDbInitialized();
    const { code } = await params;
    
    if (!/^[A-Za-z0-9]{6,8}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 404 }
      );
    }
    
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT url FROM links WHERE code = $1',
        [code]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404 }
        );
      }
      
      const url = result.rows[0].url;
      
      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked_at = CURRENT_TIMESTAMP WHERE code = $1',
        [code]
      );
      
      return NextResponse.redirect(url, { status: 302 });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

