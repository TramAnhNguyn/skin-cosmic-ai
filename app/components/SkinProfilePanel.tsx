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
    <section className="rounded-3xl border border-white dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 backdrop-blur-xl transition-colors duration-300">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/30 p-2.5 text-teal-600 dark:text-teal-400 shadow-sm border border-teal-100/50 dark:border-teal-800/50 transition-colors">
            <UserRound size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 transition-colors">Skin Profile</h2>
            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 transition-colors">Cá nhân hóa chu trình của bạn</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors">
            <Sparkles size={16} className="text-teal-500 dark:text-teal-400" /> Loại da
          </span>
          <select
            value={profile.skinType}
            onChange={(event) => {
              onChange({
                ...profile,
                skinType: event.target.value,
                concerns: [],
                avoidIngredients: '',
                budget: '',
                currentProducts: ''
              });
            }}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 shadow-sm appearance-none"
          >
            <option value="">Chọn loại da của bạn</option>
            {skinTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-3 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors">
            <Target size={16} className="text-teal-500 dark:text-teal-400" /> Vấn đề quan tâm
          </span>
          <div className="flex flex-wrap gap-2.5">
            {concernOptions.map((concern) => {
              const isActive = profile.concerns?.includes(concern);

              return (
                <button
                  key={concern}
                  type="button"
                  onClick={() => toggleConcern(concern)}
                  className={`rounded-full border px-4 py-2 text-[13px] font-bold transition-all duration-200 ${
                    isActive
                      ? 'border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-500/20 scale-105'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-teal-200 dark:hover:border-teal-700 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300'
                  }`}
                >
                  {concern}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors">
            <AlertTriangle size={16} className="text-teal-500 dark:text-teal-400" /> Cần tránh (dị ứng)
          </span>
          <textarea
            value={profile.avoidIngredients}
            onChange={(event) => updateField('avoidIngredients', event.target.value)}
            rows={2}
            placeholder="Ví dụ: cồn khô, hương liệu, BHA..."
            className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 shadow-sm"
          />
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors">
            <Wallet size={16} className="text-teal-500 dark:text-teal-400" /> Ngân sách
          </span>
          <select
            value={profile.budget}
            onChange={(event) => updateField('budget', event.target.value)}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 outline-none transition-all focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 shadow-sm appearance-none"
          >
            <option value="">Chọn ngân sách dự kiến</option>
            {budgetOptions.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 transition-colors">
            <span className="h-4 w-4 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-[10px] text-teal-600 dark:text-teal-400 font-black">!</span> Sản phẩm đang dùng
          </span>
          <textarea
            value={profile.currentProducts}
            onChange={(event) => updateField('currentProducts', event.target.value)}
            rows={2}
            placeholder="Sữa rửa mặt, toner, serum, kem dưỡng..."
            className="w-full resize-none rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-[15px] font-medium text-slate-700 dark:text-slate-200 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-400 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 shadow-sm"
          />
        </label>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onSave}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3.5 text-[14px] font-extrabold text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 active:scale-95"
          >
            <Save size={18} /> Lưu hồ sơ
          </button>
          <button
            type="button"
            onClick={onGenerateRoutine}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-teal-500 to-emerald-500 px-4 py-3.5 text-[14px] font-extrabold text-white shadow-lg shadow-teal-500/20 dark:shadow-teal-900/40 transition-all hover:scale-[1.02] hover:shadow-teal-500/40 active:scale-95"
          >
            <Sparkles size={18} /> Tạo routine
          </button>
        </div>
      </div>
    </section>
  );
}
