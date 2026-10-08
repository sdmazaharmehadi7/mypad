import { NextResponse } from 'next/server';
import { getPadByPath, savePadContent, savePadTheme } from '@/lib/pads-db';

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

    const { pad, normalizedPath, error } = await getPadByPath(path);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    if (!pad) {
      return NextResponse.json(
        {
          pad: {
            path: normalizedPath,
            content: '',
            theme: 'light',
            isNew: true,
          },
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        }
      );
    }

    return NextResponse.json(
      { pad },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('GET /api/pads error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, content, theme } = body;

    if (!path) {
      return NextResponse.json(
        { error: 'Missing "path" in request body.' },
        { status: 400 }
      );
    }

    // Dedicated theme update
    if (content === undefined && theme) {
      const result = await savePadTheme(path, theme);
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json(
        { success: true, theme: result.theme, path: result.path },
        { status: 200, headers: { 'Cache-Control': 'no-store, max-age=0' } }
      );
    }

    const result = await savePadContent(path, content ?? '', theme);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      {
        pad: result.pad,
        skipped: result.skipped,
        normalizedPath: result.normalizedPath,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('POST /api/pads error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
