'use client';

import { AlertTriangle, Save, Sparkles, Target, UserRound, Wallet } from 'lucide-react';

export type SkinProfile = {
  skinType: string;
  concerns: string[];
  avoidIngredients: string;
  budget: string;
  currentProducts: string;
};

type SkinProfilePanelProps = {
  profile: SkinProfile;
  onChange: (profile: SkinProfile) => void;
  onSave: () => void;
  onGenerateRoutine: () => void;
};

const skinTypes = ['Da dầu', 'Da khô', 'Da hỗn hợp', 'Da nhạy cảm', 'Da thường'];
const concernOptions = ['Mụn', 'Thâm mụn', 'Nám/sạm màu', 'Khô bong tróc', 'Lỗ chân lông to', 'Lão hóa'];
const budgetOptions = ['Dưới 500k', '500k - 1 triệu', '1 triệu - 2 triệu', 'Trên 2 triệu'];

export default function SkinProfilePanel({ profile, onChange, onSave, onGenerateRoutine }: SkinProfilePanelProps) {
  const updateField = (field: keyof SkinProfile, value: string | string[]) => {
    onChange({ ...profile, [field]: value });
  };

  const toggleConcern = (concern: string) => {
    const concerns = profile.concerns || [];
    const nextConcerns = concerns.includes(concern)
      ? concerns.filter((item) => item !== concern)
      : [...concerns, concern];

    updateField('concerns', nextConcerns);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-teal-400/15 p-2 text-teal-200">
            <UserRound size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Skin profile</h2>
            <p className="text-xs text-white/50">Cá nhân hóa tư vấn và routine</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/60">
            <Sparkles size={14} /> Loại da
          </span>
          <select
            value={profile.skinType}
            onChange={(event) => updateField('skinType', event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-teal-300"
          >
            <option value="">Chọn loại da</option>
            {skinTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/60">
            <Target size={14} /> Vấn đề ưu tiên
          </span>
          <div className="flex flex-wrap gap-2">
            {concernOptions.map((concern) => {
              const isActive = profile.concerns?.includes(concern);

              return (
                <button
                  key={concern}
                  type="button"
                  onClick={() => toggleConcern(concern)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'border-teal-300 bg-teal-300 text-slate-950'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-teal-300/60 hover:text-white'
                  }`}
                >
                  {concern}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/60">
            <AlertTriangle size={14} /> Dị ứng / thành phần cần tránh
          </span>
          <textarea
            value={profile.avoidIngredients}
            onChange={(event) => updateField('avoidIngredients', event.target.value)}
            rows={3}
            placeholder="Ví dụ: alcohol denat, hương liệu, retinol..."
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-teal-300"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-white/60">
            <Wallet size={14} /> Ngân sách
          </span>
          <select
            value={profile.budget}
            onChange={(event) => updateField('budget', event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition focus:border-teal-300"
          >
            <option value="">Chọn ngân sách</option>
            {budgetOptions.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 text-xs font-semibold uppercase text-white/60">Sản phẩm đang dùng</span>
          <textarea
            value={profile.currentProducts}
            onChange={(event) => updateField('currentProducts', event.target.value)}
            rows={3}
            placeholder="Sữa rửa mặt, serum, kem dưỡng, chống nắng..."
            className="w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-teal-300"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
          >
            <Save size={16} /> Lưu profile
          </button>
          <button
            type="button"
            onClick={onGenerateRoutine}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-teal-400 to-emerald-400 px-3 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-500/20 transition hover:from-teal-300 hover:to-emerald-300"
          >
            <Sparkles size={16} /> Routine
          </button>
        </div>
      </div>
    </section>
  );
}
