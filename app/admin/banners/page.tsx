"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  iconUrl: string | null;
  isActive: boolean;
  order: number;
  createdAt: string;
}

const EMPTY: Omit<Banner, "id" | "createdAt"> = {
  title: "",
  subtitle: "",
  ctaText: "",
  ctaLink: "",
  iconUrl: "",
  isActive: true,
  order: 0,
};

export default function BannersAdminPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) setBanners(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      if (isNew) {
        await fetch("/api/admin/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      } else {
        await fetch(`/api/admin/banners/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editing),
        });
      }
      setEditing(null);
      setIsNew(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner: Banner) {
    await fetch(`/api/admin/banners/${banner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !banner.isActive }),
    });
    await load();
  }

  async function remove(id: string) {
    if (!confirm("배너를 삭제할까요?")) return;
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">배너 관리</h1>
          <p className="text-sm text-gray-400 mt-1">홈 화면에 표시될 배너를 관리합니다</p>
        </div>
        <button
          onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4F8AFF] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          새 배너
        </button>
      </div>

      {/* Edit / Create form */}
      {editing && (
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white">
            {isNew ? "새 배너 만들기" : "배너 수정"}
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-400 block mb-1">제목 *</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4F8AFF]/60"
                placeholder="배너 제목을 입력하세요"
                value={editing.title ?? ""}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">부제목</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4F8AFF]/60"
                placeholder="부제목 (선택)"
                value={editing.subtitle ?? ""}
                onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">아이콘 이미지 URL</label>
              <input
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4F8AFF]/60"
                placeholder="https://... (로고/아이콘 이미지 URL)"
                value={editing.iconUrl ?? ""}
                onChange={(e) => setEditing({ ...editing, iconUrl: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">버튼 텍스트</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4F8AFF]/60"
                  placeholder="더 보기"
                  value={editing.ctaText ?? ""}
                  onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">링크 URL</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-[#4F8AFF]/60"
                  placeholder="https://..."
                  value={editing.ctaLink ?? ""}
                  onChange={(e) => setEditing({ ...editing, ctaLink: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">순서</label>
                <input
                  type="number"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4F8AFF]/60"
                  value={editing.order ?? 0}
                  onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => setEditing({ ...editing, isActive: !editing.isActive })}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      editing.isActive ? "bg-[#4F8AFF]" : "bg-white/15"
                    } relative flex-shrink-0 cursor-pointer`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        editing.isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-300">활성화</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              disabled={!editing.title || saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4F8AFF] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              저장
            </button>
            <button
              onClick={() => { setEditing(null); setIsNew(false); }}
              className="px-4 py-2 rounded-xl bg-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Banner list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 text-gray-500 text-sm">
          배너가 없습니다. 새 배너를 추가해보세요.
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`rounded-2xl border px-5 py-4 flex items-start gap-4 transition-opacity ${
                banner.isActive
                  ? "border-white/10 bg-white/[0.03]"
                  : "border-white/5 bg-white/[0.015] opacity-50"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{banner.title}</span>
                  {banner.isActive && (
                    <span className="text-[10px] bg-[#4F8AFF]/20 text-[#4F8AFF] px-1.5 py-0.5 rounded-full font-medium">
                      활성
                    </span>
                  )}
                </div>
                {banner.subtitle && (
                  <p className="text-xs text-gray-400">{banner.subtitle}</p>
                )}
                {banner.iconUrl && (
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    🖼 {banner.iconUrl}
                  </p>
                )}
                {(banner.ctaText || banner.ctaLink) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {banner.ctaText && `버튼: ${banner.ctaText}`}{banner.ctaLink && ` → ${banner.ctaLink}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => toggleActive(banner)}
                  title={banner.isActive ? "비활성화" : "활성화"}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => { setEditing({ ...banner }); setIsNew(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => remove(banner.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
