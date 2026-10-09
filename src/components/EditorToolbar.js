'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useEditorState } from '@tiptap/react';
import { isValidUrl } from '@/lib/sanitize';
import { detectCode } from '@/lib/code-detector';

function formatRedirectUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:')
  ) {
    return '';
  }
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export default function EditorToolbar({ editor }) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [hasSelection, setHasSelection] = useState(false);
  const [dialogPos, setDialogPos] = useState({ top: 44, left: 16, width: 340 });

  const toolbarRef = useRef(null);
  const dialogRef = useRef(null);
  const linkButtonRef = useRef(null);
  const urlInputRef = useRef(null);
  const savedSelectionRef = useRef(null);
  const lastSelectionRef = useRef(null);
  const [, setSelectionSyncTick] = useState(0);

  // Synchronously track editor selection updates so toolbar clicks never lose the selection
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const onSelectionChange = () => {
      const { from, to, empty } = editor.state.selection;
      lastSelectionRef.current = { from, to, empty };
      setSelectionSyncTick((t) => (t + 1) % 1000000);
    };

    onSelectionChange();
    editor.on('selectionUpdate', onSelectionChange);
    editor.on('transaction', onSelectionChange);
    editor.on('focus', onSelectionChange);

    return () => {
      editor.off('selectionUpdate', onSelectionChange);
      editor.off('transaction', onSelectionChange);
      editor.off('focus', onSelectionChange);
    };
  }, [editor]);

  // Read current formatting state reactively whenever selection or document changes
  const editorState = useEditorState({
    editor,
    selector: (ctx) => {
      const ed = ctx.editor;
      if (!ed || ed.isDestroyed) {
        return {
          isH1: false,
          isH2: false,
          isH3: false,
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isCode: false,
          isCodeBlock: false,
          isBulletList: false,
          isOrderedList: false,
          isTaskList: false,
          isBlockquote: false,
          isLink: false,
          linkHref: '',
        };
      }

      return {
        isH1: ed.isActive('heading', { level: 1 }),
        isH2: ed.isActive('heading', { level: 2 }),
        isH3: ed.isActive('heading', { level: 3 }),
        isBold: ed.isActive('bold'),
        isItalic: ed.isActive('italic'),
        isUnderline: ed.isActive('underline'),
        isStrike: ed.isActive('strike'),
        // Active when cursor/selection is inside inline code or inside a code block
        isCode: ed.isActive('code') || ed.isActive('codeBlock'),
        isCodeBlock: ed.isActive('codeBlock'),
        isBulletList: ed.isActive('bulletList'),
        isOrderedList: ed.isActive('orderedList'),
        isTaskList: ed.isActive('taskList'),
        isBlockquote: ed.isActive('blockquote'),
        isLink: ed.isActive('link'),
        linkHref: ed.getAttributes('link').href || '',
      };
    },
  });

  const isH1 = editorState ? editorState.isH1 : (editor ? editor.isActive('heading', { level: 1 }) : false);
  const isH2 = editorState ? editorState.isH2 : (editor ? editor.isActive('heading', { level: 2 }) : false);
  const isH3 = editorState ? editorState.isH3 : (editor ? editor.isActive('heading', { level: 3 }) : false);
  const isBold = editorState ? editorState.isBold : (editor ? editor.isActive('bold') : false);
  const isItalic = editorState ? editorState.isItalic : (editor ? editor.isActive('italic') : false);
  const isUnderline = editorState ? editorState.isUnderline : (editor ? editor.isActive('underline') : false);
  const isStrike = editorState ? editorState.isStrike : (editor ? editor.isActive('strike') : false);
  const isCode = editorState ? editorState.isCode : (editor ? (editor.isActive('code') || editor.isActive('codeBlock')) : false);
  const isCodeBlock = editorState ? editorState.isCodeBlock : (editor ? editor.isActive('codeBlock') : false);
  const isBulletList = editorState ? editorState.isBulletList : (editor ? editor.isActive('bulletList') : false);
  const isOrderedList = editorState ? editorState.isOrderedList : (editor ? editor.isActive('orderedList') : false);
  const isTaskList = editorState ? editorState.isTaskList : (editor ? editor.isActive('taskList') : false);
  const isBlockquote = editorState ? editorState.isBlockquote : (editor ? editor.isActive('blockquote') : false);
  const isLink = editorState ? editorState.isLink : (editor ? editor.isActive('link') : false);
  const linkHref = editorState ? editorState.linkHref : (editor ? (editor.getAttributes('link').href || '') : '');

  // Command execution helper that guarantees the formatting applies strictly to the user's intended selection
  const handleFormat = useCallback(
    (action) => {
      if (!editor || editor.isDestroyed) return;

      const currentSel = editor.state.selection;
      const savedSel = lastSelectionRef.current;

      // Prefer non-empty selection: if current selection collapsed or moved due to focus/touch shift, restore saved selection
      let from = currentSel.from;
      let to = currentSel.to;
      let isNonEmpty = !currentSel.empty;

      if (currentSel.empty && savedSel && !savedSel.empty) {
        from = savedSel.from;
        to = savedSel.to;
        isNonEmpty = true;
      }

      let chain = editor.chain().focus();
      if (isNonEmpty) {
        chain = chain.setTextSelection({ from, to });
      }

      action(chain, { from, to, isNonEmpty });
    },
    [editor]
  );

  const handleOpenLinkDialog = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    const currentSel = editor.state.selection;
    const savedSel = lastSelectionRef.current;
    const target = !currentSel.empty ? currentSel : (savedSel && !savedSel.empty ? savedSel : currentSel);

    const { from, to, empty } = target;
    savedSelectionRef.current = { from, to, empty };
    setHasSelection(!empty);

    let text = '';
    if (!empty) {
      text = editor.state.doc.textBetween(from, to, ' ');
    }
    setLinkText(text);

    // Compute stable floating positioning relative to the toolbar
    if (toolbarRef.current && editor.view) {
      try {
        const coords = editor.view.coordsAtPos(from);
        const toolbarRect = toolbarRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const dialogWidth = Math.min(340, Math.max(280, viewportWidth - 24));

        let left = coords.left - toolbarRect.left;
        left = Math.max(8, Math.min(toolbarRect.width - dialogWidth - 8, left));

        let top = Math.max(toolbarRect.height + 6, coords.bottom - toolbarRect.top + 8);
        if (coords.bottom + 220 > window.innerHeight && coords.top - 200 > toolbarRect.bottom) {
          top = Math.max(toolbarRect.height + 6, coords.top - toolbarRect.top - 210);
        }

        setDialogPos({ top, left, width: dialogWidth });
      } catch {
        setDialogPos({ top: 44, left: 16, width: 340 });
      }
    }

    let currentHref = editor.getAttributes('link').href || '';
    if (!currentHref && target) {
      try {
        const $pos = editor.state.doc.resolve(from);
        const linkMark = $pos.marks().find((m) => m.type.name === 'link');
        if (linkMark && linkMark.attrs?.href) {
          currentHref = linkMark.attrs.href;
        }
      } catch {}
    }
    setLinkUrl(currentHref);
    setIsLinkDialogOpen(true);

    setTimeout(() => {
      if (urlInputRef.current) {
        urlInputRef.current.focus();
        urlInputRef.current.select();
      }
    }, 50);
  }, [editor]);

  // Listen for Cmd+K shortcut event
  useEffect(() => {
    const handleShortcut = () => {
      handleOpenLinkDialog();
    };

    window.addEventListener('mypad:open-link-dialog', handleShortcut);
    return () => window.removeEventListener('mypad:open-link-dialog', handleShortcut);
  }, [handleOpenLinkDialog]);

  // Close dialog and cleanly restore editor selection & focus without modifying content
  const handleCloseLinkDialog = useCallback(() => {
    setIsLinkDialogOpen(false);
    const saved = savedSelectionRef.current;
    if (editor && !editor.isDestroyed) {
      try {
        if (saved && !saved.empty) {
          editor.chain().focus().setTextSelection({ from: saved.from, to: saved.to }).run();
        } else {
          editor.chain().focus().run();
        }
      } catch {
        // safe fallback
      }
    }
  }, [editor]);

  // Handle closing via Escape key and clicking outside
  useEffect(() => {
    if (!isLinkDialogOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseLinkDialog();
      }
    };

    const handleClickOutside = (e) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target)) {
        if (linkButtonRef.current && linkButtonRef.current.contains(e.target)) {
          return;
        }
        handleCloseLinkDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handleClickOutside, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('pointerdown', handleClickOutside, true);
    };
  }, [isLinkDialogOpen, handleCloseLinkDialog]);

  if (!editor) return null;

  const handleSetLink = (e) => {
    if (e) e.preventDefault();

    const rawUrl = linkUrl.trim();
    if (!rawUrl) {
      handleRemoveLink();
      return;
    }

    // Disallow dangerous script/data protocols
    const lower = rawUrl.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:')
    ) {
      alert('Invalid URL: Dangerous protocols are not permitted.');
      return;
    }

    let urlToSet = rawUrl;
    if (
      !urlToSet.startsWith('http://') &&
      !urlToSet.startsWith('https://') &&
      !urlToSet.startsWith('/') &&
      !urlToSet.startsWith('mailto:')
    ) {
      urlToSet = `https://${urlToSet}`;
    }

    if (!isValidUrl(urlToSet)) {
      alert('Please enter a valid web URL (e.g. https://example.com)');
      return;
    }

    const saved = savedSelectionRef.current;

    if (!saved || saved.empty) {
      // No text selected: insert new link with display text
      const displayText = linkText.trim() || urlToSet;
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: displayText,
          marks: [{ type: 'link', attrs: { href: urlToSet } }],
        })
        .run();
    } else {
      // Text was selected: apply link mark strictly to the saved selection range without expanding
      editor
        .chain()
        .focus()
        .setTextSelection({ from: saved.from, to: saved.to })
        .setLink({ href: urlToSet })
        .run();
    }

    setIsLinkDialogOpen(false);
  };

  const handleRemoveLink = () => {
    const saved = savedSelectionRef.current;
    if (saved && !saved.empty) {
      editor
        .chain()
        .focus()
        .setTextSelection({ from: saved.from, to: saved.to })
        .unsetLink()
        .run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setIsLinkDialogOpen(false);
  };

  const handleOpenCurrentUrl = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const urlToOpen = formatRedirectUrl(linkUrl || linkHref);
    if (urlToOpen) {
      window.open(urlToOpen, '_blank', 'noopener,noreferrer');
    }
  };

  // Prevent button pointer events from blurring the editor contenteditable
  const preventBlur = (e) => {
    e.preventDefault();
  };

  return (
    <div
      ref={toolbarRef}
      className="relative w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 select-none"
    >
      <div className="flex items-center gap-1 overflow-x-auto py-1 px-3 sm:px-6 text-zinc-600 dark:text-zinc-400 font-sans text-xs shrink-0 pad-scrollbar">
        {/* Headings */}
        <div className="flex items-center gap-0.5 pr-1.5 border-r border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleHeading({ level: 1 }).run())}
            className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
              isH1
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Heading 1"
            aria-label="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleHeading({ level: 2 }).run())}
            className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
              isH2
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Heading 2"
            aria-label="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleHeading({ level: 3 }).run())}
            className={`px-2 py-1 rounded-md font-semibold text-xs transition-colors ${
              isH3
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Heading 3"
            aria-label="Heading 3"
          >
            H3
          </button>
        </div>

        {/* Text Styling: Bold, Italic, Underline, Strikethrough, Inline Code */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleBold().run())}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-bold text-xs transition-colors ${
              isBold
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Bold (Cmd+B)"
            aria-label="Bold"
          >
            B
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleItalic().run())}
            className={`w-7 h-7 flex items-center justify-center rounded-md italic font-serif text-sm transition-colors ${
              isItalic
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Italic (Cmd+I)"
            aria-label="Italic"
          >
            I
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleUnderline().run())}
            className={`w-7 h-7 flex items-center justify-center rounded-md underline text-xs font-medium transition-colors ${
              isUnderline
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Underline (Cmd+U)"
            aria-label="Underline"
          >
            U
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleStrike().run())}
            className={`w-7 h-7 flex items-center justify-center rounded-md line-through text-xs font-medium transition-colors ${
              isStrike
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Strikethrough"
            aria-label="Strikethrough"
          >
            S
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleCode().run())}
            className={`w-7 h-7 flex items-center justify-center rounded-md font-mono text-xs transition-colors ${
              isCode
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Code"
            aria-label="Code"
          >
            {'<>'}
          </button>
        </div>

        {/* Lists: Bullet, Numbered, Checklist */}
        <div className="flex items-center gap-0.5 px-1.5 border-r border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleBulletList().run())}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isBulletList
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Bullet List"
            aria-label="Bullet List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.007 5.25H3.75v.008h.007V12zm0 5.25H3.75v.008h.007v-.008z" />
            </svg>
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleOrderedList().run())}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isOrderedList
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Numbered List"
            aria-label="Numbered List"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleTaskList().run())}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isTaskList
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Checklist"
            aria-label="Checklist"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Quote, Code Block, Link, Divider */}
        <div className="flex items-center gap-0.5 pl-1.5">
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.toggleBlockquote().run())}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              isBlockquote
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Blockquote"
            aria-label="Blockquote"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 5.25h16.5" />
            </svg>
          </button>
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() =>
              handleFormat((chain, { from, to, isNonEmpty }) => {
                if (!isNonEmpty) {
                  // Cursor without selection: toggle current node
                  chain.toggleCodeBlock().run();
                  return;
                }

                // If already inside a code block, toggle it back
                if (editor.isActive('codeBlock')) {
                  chain.toggleCodeBlock().run();
                  return;
                }

                const doc = editor.state.doc;
                const $from = doc.resolve(from);
                const $to = doc.resolve(to);

                // If selection is a sub-part of a paragraph, convert strictly the selected text
                if (
                  $from.sameParent($to) &&
                  $from.parent.isTextblock &&
                  (from > $from.start() || to < $from.end())
                ) {
                  const text = doc.textBetween(from, to, '\n');
                  const detected = detectCode(text);
                  const lang = detected.isCode && detected.language !== 'generic' ? detected.language : null;
                  const node = editor.schema.nodes.codeBlock.create(
                    { language: lang },
                    text ? editor.schema.text(text) : null
                  );
                  chain.insertContentAt({ from, to }, node.toJSON()).run();
                } else {
                  // Selection spans entire block(s) or multiple lines
                  chain.toggleCodeBlock().run();
                }
              })
            }
            className={`p-1.5 rounded-md text-xs font-mono transition-colors ${
              isCodeBlock
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Code Block"
            aria-label="Code Block"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
          </button>
          <button
            ref={linkButtonRef}
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={handleOpenLinkDialog}
            className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              isLink
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950'
                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
            }`}
            title="Link (Cmd+K)"
            aria-label="Link"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.364-3.182l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
          </button>
          {isLink && (linkHref || linkUrl) && (
            <a
              href={formatRedirectUrl(linkHref || linkUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded-md text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0 decoration-transparent"
              title={`Open ${linkHref || linkUrl} in new tab`}
              aria-label={`Open link ${linkHref || linkUrl}`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
              <span className="hidden sm:inline text-[11px] font-sans">Open</span>
            </a>
          )}
          <button
            type="button"
            onPointerDown={preventBlur}
            onMouseDown={preventBlur}
            onClick={() => handleFormat((chain) => chain.setHorizontalRule().run())}
            className="p-1.5 rounded-md text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 transition-colors"
            title="Horizontal Divider"
            aria-label="Horizontal Divider"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating Add/Edit Link Dialog */}
      {isLinkDialogOpen && (
        <div
          ref={dialogRef}
          style={{
            top: `${dialogPos.top}px`,
            left: `${dialogPos.left}px`,
            width: `${dialogPos.width}px`,
          }}
          className="absolute z-50 p-3.5 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col gap-2.5 box-border select-auto animate-in fade-in slide-in-from-top-1 duration-150 max-w-[calc(100vw-24px)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-900 dark:text-zinc-100 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <span>{isLink ? 'Edit Link' : 'Add Link'}</span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCloseLinkDialog();
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-1 -mr-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              aria-label="Close link dialog"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Selected text indicator (if any) with truncation */}
          {hasSelection && linkText && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/60 px-2.5 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-750 overflow-hidden">
              <span className="shrink-0 text-[11px] font-mono text-zinc-400 dark:text-zinc-500">Target:</span>
              <span className="truncate font-medium text-zinc-800 dark:text-zinc-200" title={linkText}>
                {linkText}
              </span>
            </div>
          )}

          <form onSubmit={handleSetLink} className="flex flex-col gap-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="link-url-input" className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                  Destination URL
                </label>
                {formatRedirectUrl(linkUrl || linkHref) && (
                  <a
                    href={formatRedirectUrl(linkUrl || linkHref)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title={`Open ${formatRedirectUrl(linkUrl || linkHref)} in new tab`}
                  >
                    <span>Open in new tab</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
              </div>
              <input
                id="link-url-input"
                ref={urlInputRef}
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 font-mono box-border"
              />
            </div>

            {!hasSelection && (
              <div>
                <label htmlFor="link-text-input" className="block text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                  Display Text (optional)
                </label>
                <input
                  id="link-text-input"
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Link label"
                  className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 rounded-lg focus:outline-none focus:border-zinc-950 dark:focus:border-zinc-400 box-border"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-1 gap-2">
              <div className="flex items-center gap-1.5">
                {formatRedirectUrl(linkUrl || linkHref) && (
                  <a
                    href={formatRedirectUrl(linkUrl || linkHref)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer decoration-transparent"
                    title="Open link in new tab"
                  >
                    <span>Open</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </a>
                )}
                {(isLink || (editor && editor.isActive('link'))) && (
                  <button
                    type="button"
                    onClick={handleRemoveLink}
                    className="px-2.5 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="ml-auto px-3.5 py-1.5 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 rounded-lg text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs cursor-pointer"
              >
                {isLink ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
