'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';

import CodeBlockComponent from './CodeBlockComponent';
import EditorToolbar from './EditorToolbar';
import { detectCode, extractFencedCode } from '@/lib/code-detector';
import { sanitizeHtml } from '@/lib/sanitize';
import { contentToDoc, countWords } from '@/lib/pad-content';

const lowlight = createLowlight(common);

export default function SmartEditor({
  initialContent,
  onContentChange,
  onWordCountChange,
  canonicalPath,
  editorRef,
}) {
  const isInternalUpdateRef = useRef(false);

  // Initialize Tiptap
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Replaced by CodeBlockLowlight
        heading: {
          levels: [1, 2, 3],
        },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: {
          class: 'text-zinc-950 dark:text-zinc-100 underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-500 hover:decoration-zinc-950 dark:hover:decoration-zinc-100 font-medium cursor-pointer',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list not-prose pl-0 list-none my-2 space-y-1',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({
        lowlight,
        defaultLanguage: null,
      }),
    ],
    content: contentToDoc(initialContent),
    editorProps: {
      attributes: {
        class: 'min-h-[calc(100vh-12rem)] w-full focus:outline-none text-zinc-900 dark:text-zinc-100 font-sans text-sm sm:text-base selection:bg-zinc-200/80 dark:selection:bg-zinc-800 leading-relaxed p-4 sm:p-8',
        'aria-label': `Document pad editor for ${canonicalPath}`,
      },
      handleClick(view, pos, event) {
        // Cmd/Ctrl + Click on a link opens it in a new browser tab
        if (event.metaKey || event.ctrlKey) {
          const { doc } = view.state;
          const $pos = doc.resolve(pos);
          const linkMark = $pos.marks().find((m) => m.type.name === 'link');
          if (linkMark && linkMark.attrs?.href) {
            window.open(linkMark.attrs.href, '_blank', 'noopener,noreferrer');
            return true;
          }
        }
        return false;
      },
      handlePaste(view, event) {
        const clipboard = event.clipboardData;
        if (!clipboard) return false;

        const { state, dispatch } = view;
        const { selection } = state;
        const text = clipboard.getData('text/plain') || '';
        const html = clipboard.getData('text/html') || '';

        // If cursor is ALREADY inside an active code block, preserve raw code text exactly
        if (selection.$from.parent.type.name === 'codeBlock') {
          event.preventDefault();
          const tr = state.tr.insertText(text);
          dispatch(tr);
          return true;
        }

        // 1. Fenced Code Block Detection (e.g. ```js\ncode\n```)
        const fenced = extractFencedCode(text);
        if (fenced) {
          event.preventDefault();
          const { schema } = state;
          const lang = fenced.language === 'generic' ? null : fenced.language;
          const node = schema.nodes.codeBlock.create(
            { language: lang },
            fenced.code ? schema.text(fenced.code) : null
          );
          const tr = state.tr.replaceSelectionWith(node);
          dispatch(tr);
          return true;
        }

        // 2. Conservative Automatic Code Detection
        const detected = detectCode(text);
        if (detected.isCode) {
          event.preventDefault();
          const { schema } = state;
          const lang = detected.language === 'generic' ? null : detected.language;
          const node = schema.nodes.codeBlock.create(
            { language: lang },
            schema.text(text)
          );
          const tr = state.tr.replaceSelectionWith(node);
          dispatch(tr);
          return true;
        }

        // 3. Rich HTML Paste with Sanitization
        if (html && html.trim().length > 0) {
          const sanitized = sanitizeHtml(html);
          if (sanitized && sanitized.trim().length > 0) {
            return false;
          }
        }

        // Standard text fallback
        return false;
      },
      handleKeyDown(view, event) {
        // Cmd/Ctrl + K shortcut for Link Dialog
        if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
          event.preventDefault();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('mypad:open-link-dialog'));
          }
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor: currentEditor }) {
      isInternalUpdateRef.current = true;
      const json = currentEditor.getJSON();
      const serialized = JSON.stringify(json);
      onContentChange(serialized);

      if (onWordCountChange) {
        const text = currentEditor.getText();
        onWordCountChange(countWords(text));
      }
    },
  });

  // Expose editor instance to parent if ref provided
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);

  // Synchronize external content updates (e.g. from background sync or reload)
  const setRemoteContent = useCallback(
    (newContent) => {
      if (!editor || isInternalUpdateRef.current) {
        isInternalUpdateRef.current = false;
        return;
      }
      const newDoc = contentToDoc(newContent);
      const currentDoc = editor.getJSON();

      // Only update if content actually differs
      if (JSON.stringify(currentDoc) !== JSON.stringify(newDoc)) {
        editor.commands.setContent(newDoc, false);
        if (onWordCountChange) {
          onWordCountChange(countWords(editor.getText()));
        }
      }
    },
    [editor, onWordCountChange]
  );

  useEffect(() => {
    if (editor && initialContent) {
      setRemoteContent(initialContent);
    }
  }, [initialContent, editor, setRemoteContent]);

  return (
    <div className="flex-1 flex flex-col w-full h-full min-w-0 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Apple Notes-style minimal formatting toolbar */}
      <EditorToolbar editor={editor} />

      {/* Editor Canvas Area */}
      <div className="flex-1 w-full h-full overflow-y-auto pad-scrollbar">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
