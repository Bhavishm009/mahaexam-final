"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link as LinkIcon,
  Unlink,
  Undo2,
  Redo2,
  RemoveFormatting,
  Eye,
  Code2,
  Minus,
} from "lucide-react";

/**
 * Modern Rich Text Editor with Visual WYSIWYG & HTML Source Mode
 * Compatible with React 19 and Next.js App Router
 */
export default function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Write content here...",
  minHeight = "240px",
  className = "",
  label,
  helperText,
}) {
  const editorRef = useRef(null);
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || "");
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  // Sync internal state when external value changes
  useEffect(() => {
    setHtmlContent(value || "");
    if (editorRef.current && !isHtmlMode) {
      if (editorRef.current.innerHTML !== (value || "")) {
        editorRef.current.innerHTML = value || "";
      }
    }
    updateCounts(value || "");
  }, [value, isHtmlMode]);

  const updateCounts = (text) => {
    const plainText = text.replace(/<[^>]*>/g, " ").trim();
    setCharCount(plainText.length);
    const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
  };

  const handleEditorInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setHtmlContent(html);
      updateCounts(html);
      if (onChange) onChange(html);
    }
  }, [onChange]);

  const handleHtmlChange = (e) => {
    const html = e.target.value;
    setHtmlContent(html);
    updateCounts(html);
    if (onChange) onChange(html);
  };

  const executeCommand = (command, value = null) => {
    if (isHtmlMode) return;
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      handleEditorInput();
    }
  };

  const handleInsertLink = () => {
    if (isHtmlMode) return;
    const url = prompt("Enter link URL (e.g. https://example.com):", "https://");
    if (url && url !== "https://") {
      executeCommand("createLink", url);
    }
  };

  const toggleHtmlMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Visual
      setIsHtmlMode(false);
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = htmlContent;
        }
      }, 0);
    } else {
      // Switching from Visual to HTML
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
      setIsHtmlMode(true);
    }
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {label}
          </label>
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {wordCount} words | {charCount} chars
          </div>
        </div>
      )}

      {/* Editor Box */}
      <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/80 shadow-inner backdrop-blur-md transition-all focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 dark:border-slate-800/80 dark:bg-slate-950/70">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 border-b border-slate-200/70 bg-slate-50/90 px-3 py-2 text-slate-700 dark:border-slate-800/70 dark:bg-slate-900/90 dark:text-slate-200">
          {/* History */}
          <div className="flex items-center space-x-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              disabled={isHtmlMode}
              title="Undo (Ctrl+Z)"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Undo2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("redo")}
              disabled={isHtmlMode}
              title="Redo (Ctrl+Y)"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Redo2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Text Formatting */}
          <div className="flex items-center space-x-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              disabled={isHtmlMode}
              title="Bold (Ctrl+B)"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bold className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              disabled={isHtmlMode}
              title="Italic (Ctrl+I)"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Italic className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              disabled={isHtmlMode}
              title="Underline (Ctrl+U)"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Underline className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              disabled={isHtmlMode}
              title="Strikethrough"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h1>")}
              disabled={isHtmlMode}
              title="Heading 1"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Heading1 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h2>")}
              disabled={isHtmlMode}
              title="Heading 2"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Heading2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<h3>")}
              disabled={isHtmlMode}
              title="Heading 3"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Heading3 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              disabled={isHtmlMode}
              title="Bullet List"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              disabled={isHtmlMode}
              title="Numbered List"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Block Elements */}
          <div className="flex items-center space-x-0.5 border-r border-slate-200 pr-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<blockquote>")}
              disabled={isHtmlMode}
              title="Quote"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("formatBlock", "<pre>")}
              disabled={isHtmlMode}
              title="Code Block"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertHorizontalRule")}
              disabled={isHtmlMode}
              title="Horizontal Divider"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Links & Clean */}
          <div className="flex items-center space-x-0.5">
            <button
              type="button"
              onClick={handleInsertLink}
              disabled={isHtmlMode}
              title="Insert Link"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("unlink")}
              disabled={isHtmlMode}
              title="Remove Link"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Unlink className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("removeFormat")}
              disabled={isHtmlMode}
              title="Clear Formatting"
              className="rounded p-1.5 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RemoveFormatting className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* HTML Source Mode Toggle */}
          <div className="ml-auto flex items-center">
            <button
              type="button"
              onClick={toggleHtmlMode}
              title={isHtmlMode ? "Switch to Visual WYSIWYG" : "Switch to HTML Source Code"}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                isHtmlMode
                  ? "bg-sky-500 text-white shadow-sm shadow-sky-500/20"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {isHtmlMode ? (
                <>
                  <Eye className="h-3 w-3" /> Visual
                </>
              ) : (
                <>
                  <Code2 className="h-3 w-3" /> HTML
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          {isHtmlMode ? (
            <textarea
              value={htmlContent}
              onChange={handleHtmlChange}
              placeholder="Enter raw HTML markup..."
              style={{ minHeight }}
              className="w-full resize-y bg-slate-900 p-4 font-mono text-xs text-sky-300 outline-none placeholder:text-slate-600 focus:ring-0"
              rows={10}
            />
          ) : (
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorInput}
              onBlur={handleEditorInput}
              style={{ minHeight }}
              data-placeholder={placeholder}
              className="prose prose-sm dark:prose-invert max-w-none p-4 text-sm text-slate-900 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] focus:ring-0 dark:text-slate-100"
            />
          )}
        </div>
      </div>

      {helperText && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}
