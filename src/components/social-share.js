"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Share2, Copy, Check, MessageCircle, Send, Facebook, Linkedin } from "lucide-react";
import { getBaseUrl } from "@/lib/base-url";

export default function SocialShare({
  url,
  title,
  summary = "",
  className = "",
  showLabel = true,
}) {
  const [copied, setCopied] = useState(false);

  // Fallback to getBaseUrl() if url is relative or not passed
  const getFullUrl = () => {
    const base = getBaseUrl();
    if (typeof window === "undefined") {
      if (!url) return base;
      return url.startsWith("http") ? url : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }
    return `${window.location.origin}${url || window.location.pathname}`;
  };

  const shareTitle = title || "MahaExam - महाराष्ट्र स्पर्धा परीक्षा पोर्टल";
  const shareText = summary ? `${shareTitle}\n\n${summary}` : shareTitle;

  const handleCopyLink = async () => {
    try {
      const fullUrl = getFullUrl();
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        const input = document.createElement("input");
        input.value = fullUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success("लिंक कॉपी झाली! (Link copied to clipboard)");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const fullUrl = getFullUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: summary || shareTitle,
          url: fullUrl,
        });
      } catch (err) {
        // User cancelled or share failed, silent ignore
      }
    } else {
      handleCopyLink();
    }
  };

  const fullUrl = typeof window !== "undefined" ? getFullUrl() : url || "";
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedText = encodeURIComponent(`${shareText}\n\n`);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
          <Share2 className="h-3.5 w-3.5 text-sky-500" />
          <span>शेअर करा (Share):</span>
        </span>
      )}

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedText}${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on WhatsApp"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-2.5 text-xs font-bold text-emerald-600 shadow-sm transition hover:bg-emerald-500 hover:text-white dark:border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-600"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">WhatsApp</span>
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Telegram"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/10 px-2.5 text-xs font-bold text-sky-600 shadow-sm transition hover:bg-sky-500 hover:text-white dark:border-sky-500/30 dark:bg-sky-500/20 dark:text-sky-400 dark:hover:bg-sky-600"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Telegram</span>
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-300/40 bg-slate-200/50 px-2.5 text-xs font-bold text-slate-800 shadow-sm transition hover:bg-black hover:text-white dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-white dark:hover:text-black"
      >
        <span className="text-[11px] font-black">𝕏</span>
        <span className="hidden sm:inline">Twitter</span>
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Facebook"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-blue-600/20 bg-blue-600/10 px-2.5 text-xs font-bold text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white dark:border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-600"
      >
        <Facebook className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Facebook</span>
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on LinkedIn"
        className="hidden h-8 items-center gap-1.5 rounded-xl border border-blue-700/20 bg-blue-700/10 px-2.5 text-xs font-bold text-blue-800 shadow-sm transition hover:bg-blue-700 hover:text-white dark:border-blue-400/30 dark:bg-blue-500/20 dark:text-blue-300 dark:hover:bg-blue-700 md:inline-flex"
      >
        <Linkedin className="h-3.5 w-3.5" />
        <span>LinkedIn</span>
      </a>

      {/* Native Web Share API (mobile devices) */}
      <button
        type="button"
        onClick={handleNativeShare}
        title="More Share Options"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white/80 px-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 sm:hidden"
      >
        <Share2 className="h-3.5 w-3.5 text-sky-500" />
        <span>इतर</span>
      </button>

      {/* Copy Link Button */}
      <button
        type="button"
        onClick={handleCopyLink}
        title="Copy Link to Clipboard"
        className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-300/80 bg-white/80 px-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-slate-500" />
            <span>Copy Link</span>
          </>
        )}
      </button>
    </div>
  );
}
