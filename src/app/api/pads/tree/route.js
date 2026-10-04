import { NextResponse } from 'next/server';
import { getPadNavigationContext } from '@/lib/pads-db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Missing "path" query parameter.' },
        { status: 400 }
      );
    }

    const context = await getPadNavigationContext(path);

    if (context.error) {
      return NextResponse.json({ error: context.error }, { status: 400 });
    }

    return NextResponse.json(
      { tree: context },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('GET /api/pads/tree error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
