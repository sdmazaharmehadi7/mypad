import { NextResponse } from 'next/server';
import { getPadFileForDownload, deletePadFile } from '@/lib/files-db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pads/files/[fileId]?path=/example
 * Downloads a specific file by its file ID.
 * Strictly verifies padPath match to prevent cross-pad access.
 * Returns only the requested file's binary data with proper headers.
 */
export async function GET(request, { params }) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json(
        { error: 'Missing "path" query parameter.' },
        { status: 400 }
      );
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing "fileId" parameter.' },
        { status: 400 }
      );
    }

    const { file, error } = await getPadFileForDownload(path, fileId);

    if (error || !file) {
      return NextResponse.json(
        { error: error || 'File not found or expired.' },
        { status: 404 }
      );
    }

    // Prepare filename for Content-Disposition header (RFC 5987 UTF-8 encoded filename)
    const rawFilename = file.filename || 'download';
    const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '_');
    const encodedFilename = encodeURIComponent(rawFilename);

    return new Response(file.data, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType || 'application/octet-stream',
        'Content-Length': String(file.size),
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'private, no-cache, no-transform',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('GET /api/pads/files/[fileId] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while downloading file.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pads/files/[fileId]?path=/example
 * Deletes a file from the pad.
 * Removes both the stored binary data and metadata from MongoDB.
 */
export async function DELETE(request, { params }) {
  try {
    const { fileId } = await params;
    const { searchParams } = new URL(request.url);
    let path = searchParams.get('path');

    if (!path) {
      // Also check json body if path was provided there
      try {
        const body = await request.json();
        if (body && body.path) {
          path = body.path;
        }
      } catch {
        // ignore body parse failure
      }
    }

    if (!path) {
      return NextResponse.json(
        { error: 'Missing "path" parameter.' },
        { status: 400 }
      );
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing "fileId" parameter.' },
        { status: 400 }
      );
    }

    const result = await deletePadFile(path, fileId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete file.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        fileId,
        message: 'File deleted successfully.',
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('DELETE /api/pads/files/[fileId] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while deleting file.' },
      { status: 500 }
    );
  }
}
