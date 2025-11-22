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
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM links WHERE code = $1',
        [code]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    await ensureDbInitialized();
    const { code } = await params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM links WHERE code = $1 RETURNING *',
        [code]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

