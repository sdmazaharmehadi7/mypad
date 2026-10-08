'use client';

import { useState, useRef, useCallback } from 'react';

const MAX_PAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTimeRemaining(expiresAt) {
  if (!expiresAt) return '24h';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (3600 * 1000));
  const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function getFileIcon(filename, mimeType = '') {
  const ext = (filename.split('.').pop() || '').toLowerCase();
  const mime = mimeType.toLowerCase();

  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'ico'].includes(ext)) {
    return (
      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    );
  }

  if (
    mime.includes('code') ||
    mime.includes('javascript') ||
    mime.includes('json') ||
    mime.includes('html') ||
    ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'html', 'css', 'json', 'sql', 'sh', 'md'].includes(ext)
  ) {
    return (
      <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    );
  }

  if (ext === 'pdf' || mime === 'application/pdf') {
    return (
      <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    );
  }

  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext) || mime.includes('zip') || mime.includes('compressed')) {
    return (
      <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m6.75 12-3-3m0 0-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  );
}

export default function PadAttachments({
  canonicalPath,
  isOpen,
  onClose,
  files = [],
  totalSize = 0,
  onFilesChange,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const fileInputRef = useRef(null);

  const usagePercent = Math.min(100, (totalSize / MAX_PAD_SIZE_BYTES) * 100);
  const isNearLimit = usagePercent > 80;
  const isAtLimit = usagePercent >= 100;

  const handleUploadFiles = useCallback(
    async (fileList) => {
      if (!fileList || fileList.length === 0) return;
      setUploadError(null);

      // Client pre-check for immediate feedback
      let batchSize = 0;
      for (let i = 0; i < fileList.length; i++) {
        batchSize += fileList[i].size;
      }

      if (batchSize > MAX_PAD_SIZE_BYTES) {
        setUploadError(`Selected files (${formatFileSize(batchSize)}) exceed the total 5.0 MB pad limit.`);
        return;
      }

      if (totalSize + batchSize > MAX_PAD_SIZE_BYTES) {
        const remainingBytes = Math.max(0, MAX_PAD_SIZE_BYTES - totalSize);
        setUploadError(
          `Cannot upload: current files use ${formatFileSize(totalSize)}. Selected files (${formatFileSize(
            batchSize
          )}) would exceed 5.0 MB (${formatFileSize(remainingBytes)} remaining).`
        );
        return;
      }

      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append('path', canonicalPath);
        for (let i = 0; i < fileList.length; i++) {
          formData.append('files', fileList[i]);
        }

        const res = await fetch('/api/pads/files', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setUploadError(data.error || 'Failed to upload files.');
        } else if (data.files && onFilesChange) {
          // Update parent state with newly added files
          onFilesChange((prev) => {
            const existing = Array.isArray(prev) ? prev : [];
            const newFiles = data.files.filter(
              (nf) => !existing.some((ef) => ef.fileId === nf.fileId)
            );
            return [...newFiles, ...existing];
          }, data.totalSize);
        }
      } catch (err) {
        console.error('File upload error:', err);
        setUploadError(err.message || 'Network error during upload.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [canonicalPath, totalSize, onFilesChange]
  );

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  // Download specific file ONLY when user clicks download
  const handleDownload = async (file) => {
    setDownloadingId(file.fileId);
    try {
      const url = `/api/pads/files/${encodeURIComponent(file.fileId)}?path=${encodeURIComponent(canonicalPath)}`;
      // Use hidden anchor to trigger browser download
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  // Delete file and remove immediately from UI
  const handleDelete = async (fileId) => {
    if (deletingId) return;
    setDeletingId(fileId);
    setUploadError(null);

    try {
      const res = await fetch(
        `/api/pads/files/${encodeURIComponent(fileId)}?path=${encodeURIComponent(canonicalPath)}`,
        {
          method: 'DELETE',
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Failed to delete file.');
      } else {
        // Remove file immediately from local UI state
        if (onFilesChange) {
          onFilesChange((prev) => {
            const list = Array.isArray(prev) ? prev : [];
            const remaining = list.filter((f) => f.fileId !== fileId);
            const newTotal = remaining.reduce((acc, f) => acc + (f.size || 0), 0);
            return remaining;
          });
        }
      }
    } catch (err) {
      console.error('Delete error:', err);
      setUploadError(err.message || 'Network error while deleting.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-40 sm:static sm:z-10 w-full sm:w-80 md:w-88 lg:w-96 max-w-md shrink-0 h-full border-l border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/98 dark:bg-zinc-900/98 backdrop-blur-md flex flex-col transition-all select-none overflow-hidden shadow-xl sm:shadow-none"
      aria-label="Pad Attachments"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-zinc-950">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.37l-10.94 10.94a1.5 1.5 0 0 1-2.122-2.122l7.693-7.693" />
          </svg>
          <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-100 tracking-tight">
            Attachments
          </span>
          <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
            ({files.length})
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close attachments drawer"
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Storage Quota Bar */}
      <div className="px-4 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 shrink-0">
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1.5">
          <span>{formatFileSize(totalSize)} of 5.0 MB used</span>
          <span className={isAtLimit ? 'text-red-500 font-semibold' : ''}>
            {usagePercent.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isAtLimit
                ? 'bg-red-500'
                : isNearLimit
                ? 'bg-amber-500'
                : 'bg-emerald-500 dark:bg-emerald-400'
            }`}
            style={{ width: `${Math.min(100, Math.max(usagePercent, totalSize > 0 ? 2 : 0))}%` }}
          />
        </div>
        <p className="mt-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
          <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span>Files automatically expire 24 hours after upload.</span>
        </p>
      </div>

      {/* Error alert banner */}
      {uploadError && (
        <div className="mx-3 mt-3 p-2.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/90 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-start justify-between gap-2 shrink-0">
          <div className="flex items-start gap-1.5">
            <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
            </svg>
            <span className="leading-tight">{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-red-600 dark:hover:text-red-200 p-0.5 rounded focus-visible:outline-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Drag & Drop Upload Zone */}
      <div className="p-3 shrink-0">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading || isAtLimit}
          id="pad-file-input"
        />
        <label
          htmlFor="pad-file-input"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border border-dashed transition-all cursor-pointer ${
            isAtLimit
              ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 opacity-60 cursor-not-allowed'
              : isDragging
              ? 'border-zinc-950 dark:border-zinc-200 bg-zinc-100 dark:bg-zinc-800 ring-2 ring-zinc-950/10'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900'
          }`}
        >
          {isUploading ? (
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
              <svg className="w-4 h-4 animate-spin text-zinc-600 dark:text-zinc-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Uploading files...</span>
            </div>
          ) : isAtLimit ? (
            <div className="text-center text-xs text-zinc-500 dark:text-zinc-400">
              <span className="font-medium text-red-500">Storage limit reached (5.0 MB)</span>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Delete files to upload more.</p>
            </div>
          ) : (
            <>
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 flex items-center justify-center mb-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                Drop files or <span className="underline underline-offset-2">browse</span>
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                Up to 5 MB total per pad
              </span>
            </>
          )}
        </label>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1.5 min-h-0">
        {files.length === 0 ? (
          <div className="text-center py-8 px-4 text-zinc-400 dark:text-zinc-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.37l-10.94 10.94a1.5 1.5 0 0 1-2.122-2.122l7.693-7.693" />
            </svg>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">No attachments yet</p>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
              Upload code files, notes, documents, or images to share with this pad.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isDeleting = deletingId === file.fileId;
            const isDownloading = downloadingId === file.fileId;

            return (
              <div
                key={file.fileId}
                className="group p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-between gap-2 shadow-2xs"
              >
                {/* File info */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {getFileIcon(file.filename, file.mimeType)}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate"
                      title={file.filename}
                    >
                      {file.filename}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 mt-0.5">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{formatTimeRemaining(file.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Download button */}
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    disabled={isDownloading}
                    className="p-1.5 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950"
                    title={`Download ${file.filename}`}
                    aria-label={`Download ${file.filename}`}
                  >
                    {isDownloading ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    )}
                  </button>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => handleDelete(file.fileId)}
                    disabled={isDeleting}
                    className="p-1.5 rounded-md text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500"
                    title={`Delete ${file.filename}`}
                    aria-label={`Delete ${file.filename}`}
                  >
                    {isDeleting ? (
                      <svg className="w-3.5 h-3.5 animate-spin text-red-500" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
