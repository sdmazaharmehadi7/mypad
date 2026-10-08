import { NextResponse } from 'next/server';
import {
  getPadFilesMetadata,
  savePadFiles,
  MAX_PAD_FILES_SIZE_BYTES,
} from '@/lib/files-db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/pads/files?path=/example
 * Returns file metadata list for a pad.
 * Strictly NEVER loads or returns binary file data.
 */
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

    const { files, totalSize, error } = await getPadFilesMetadata(path);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json(
      {
        files,
        totalSize,
        maxSize: MAX_PAD_FILES_SIZE_BYTES,
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('GET /api/pads/files error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while fetching files.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pads/files
 * Uploads one or multiple files to a pad using multipart/form-data.
 * Strictly enforces 5 MB total limit on the backend.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const path = formData.get('path');

    if (!path || typeof path !== 'string') {
      return NextResponse.json(
        { error: 'Missing "path" parameter in upload.' },
        { status: 400 }
      );
    }

    // Extract all uploaded files (handles field names 'files' or 'file')
    const fileEntries = [
      ...formData.getAll('files'),
      ...formData.getAll('file'),
    ].filter((entry) => entry && typeof entry === 'object' && typeof entry.arrayBuffer === 'function');

    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: 'No files provided for upload.' },
        { status: 400 }
      );
    }

    // Convert file entries into Buffers and measure backend sizes
    const filesToSave = [];
    for (const entry of fileEntries) {
      const arrayBuffer = await entry.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      filesToSave.push({
        filename: entry.name || 'unnamed_file',
        mimeType: entry.type || 'application/octet-stream',
        buffer,
      });
    }

    const result = await savePadFiles(path, filesToSave);

    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          totalSize: result.totalSize,
          maxSize: MAX_PAD_FILES_SIZE_BYTES,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        files: result.savedFiles,
        totalSize: result.totalSize,
        maxSize: MAX_PAD_FILES_SIZE_BYTES,
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      }
    );
  } catch (err) {
    console.error('POST /api/pads/files error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while saving files.' },
      { status: 500 }
    );
  }
}
