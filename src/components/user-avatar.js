"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { getInitials } from "@/lib/avatar";

export function UserAvatar({
  src,
  name = "User",
  size = "lg", // xs (28px), sm (36px), md (48px), lg (64px), xl (96px)
  editable = false,
  uploading = false,
  showStatusDot = false,
  onUpload,
}) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const sizeClasses = {
    xs: "h-7 w-7 text-[11px] font-bold rounded-xl",
    sm: "h-9 w-9 text-xs font-bold rounded-xl",
    md: "h-12 w-12 text-sm font-bold rounded-2xl",
    lg: "h-16 w-16 text-lg font-bold rounded-2xl",
    xl: "h-24 w-24 text-2xl font-black rounded-3xl",
  };

  const ringClasses = {
    xs: "border border-white/20 shadow-xs",
    sm: "border border-white/30 shadow-xs",
    md: "border-2 border-white/40 shadow-sm ring-2 ring-blue-500/10",
    lg: "border-2 border-white/40 shadow-md ring-4 ring-blue-500/10",
    xl: "border-2 border-white/40 shadow-lg ring-4 ring-blue-500/20",
  };

  const hasValidImage =
    Boolean(src) &&
    !imgError &&
    (src.startsWith("http") || src.startsWith("data:") || src.startsWith("/"));

  return (
    <div className="group relative inline-block shrink-0">
      <div
        className={`${sizeClasses[size] || sizeClasses.lg} ${ringClasses[size] || ringClasses.lg} relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-500 via-blue-600 to-purple-700 transition-all dark:border-slate-700`}
      >
        {hasValidImage ? (
          <>
            {/* Image Loading Skeleton */}
            {!imgLoaded && (
              <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
            )}
            <img
              src={src}
              alt={name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imgLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          /* Clean Initial Letter of User Name — strictly no fake/dummy avatar */
          <div className="flex h-full w-full select-none items-center justify-center font-bold text-white">
            <span className="select-none uppercase leading-none tracking-wide">
              {getInitials(name)}
            </span>
          </div>
        )}

        {/* Loading Spinner during upload */}
        {uploading && (
          <div className="backdrop-blur-xs absolute inset-0 flex items-center justify-center bg-black/60">
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Editable Camera Overlay Button */}
      {editable && (
        <>
          <label
            htmlFor="profile-avatar-input"
            title="Upload profile photo"
            className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30 transition hover:scale-110 hover:bg-blue-500 active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-400"
          >
            <Camera className="h-3.5 w-3.5" />
          </label>
          <input
            id="profile-avatar-input"
            type="file"
            accept="image/*"
            onChange={onUpload}
            disabled={uploading}
            className="hidden"
          />
        </>
      )}

      {/* Optional Online / Active Status Badge */}
      {showStatusDot && (
        <span
          title="Active User"
          className="shadow-xs absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
        />
      )}
    </div>
  );
}
