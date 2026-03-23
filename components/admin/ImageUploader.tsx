"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  previewHeight?: number;
  overlayText?: { title?: string; subtitle?: string };
}

export function ImageUploader({
  value,
  onChange,
  label = "이미지 업로드",
  hint,
  previewHeight = 220,
  overlayText,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setUploaded(false);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.success) {
        onChange(data.url);
        setUploaded(true);
        setTimeout(() => setUploaded(false), 2000);
      } else {
        setError(data.error || "업로드 실패");
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    upload(files[0]);
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{label}</span>
          {hint && <span className="text-[11px] text-gray-500">{hint}</span>}
        </div>
      )}

      {/* Preview */}
      {value && (
        <div
          className="relative w-full rounded-2xl overflow-hidden bg-[#0f0f23] border border-white/10 group"
          style={{ height: previewHeight }}
        >
          <Image
            src={value}
            alt="미리보기"
            fill
            className="object-cover"
            unoptimized
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)" }}
          />
          {overlayText && (
            <div className="absolute bottom-0 left-0 p-4">
              {overlayText.title && (
                <p className="text-white font-black text-lg leading-tight">{overlayText.title}</p>
              )}
              {overlayText.subtitle && (
                <p className="text-white/70 text-xs mt-0.5">{overlayText.subtitle}</p>
              )}
            </div>
          )}
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
          >
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          {/* Re-upload overlay */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
          >
            <span className="text-xs text-white/80 bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
              클릭하여 교체
            </span>
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          cursor-pointer transition-all select-none
          ${isDragging
            ? "border-[#4F8AFF] bg-[#4F8AFF]/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
          }
          ${isUploading ? "pointer-events-none" : ""}
        `}
        style={{ height: value ? 60 : 140 }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isUploading ? (
          <>
            <Loader2 className="w-6 h-6 text-[#4F8AFF] animate-spin" />
            <p className="text-sm text-gray-400">업로드 중...</p>
          </>
        ) : uploaded ? (
          <>
            <CheckCircle2 className="w-6 h-6 text-green-400" />
            <p className="text-sm text-green-400">업로드 완료!</p>
          </>
        ) : value ? (
          <p className="text-xs text-gray-500">
            <Upload className="w-3.5 h-3.5 inline mr-1" />
            다른 이미지로 교체
          </p>
        ) : (
          <>
            <Upload className="w-7 h-7 text-gray-500" />
            <div className="text-center">
              <p className="text-sm text-gray-300 font-medium">클릭 또는 드래그해서 업로드</p>
              <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, WEBP · 최대 5MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}

      {/* URL 직접 입력 */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-white/8" />
        <span className="text-[11px] text-gray-600">또는 URL 직접 입력</span>
        <div className="h-px flex-1 bg-white/8" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
        className="w-full bg-[#0f0f23] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#4F8AFF]/50 transition-colors"
      />
    </div>
  );
}
