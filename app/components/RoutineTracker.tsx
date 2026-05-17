'use client';

import { CalendarCheck, CheckCircle2, Circle, Moon, RotateCcw, Sun, ChevronLeft, ChevronRight, X, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export type RoutineStep = {
  phase: string;
  stepNumber: number;
  title: string;
  productName?: string;
  instruction?: string;
};

type RoutineTrackerProps = {
  routine: RoutineStep[];
  checkedSteps: Record<string, boolean>;
  onToggleStep: (stepId: string, date?: string) => void;
  onResetDay: (date?: string) => void;
  trackerByDate?: Record<string, Record<string, boolean>>;
  todayKey?: string;
};

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}

function formatDateDisplay(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('vi-VN', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function RoutineTracker({ 
  routine, 
  checkedSteps, 
  onToggleStep, 
  onResetDay,
  trackerByDate = {},
  todayKey = getTodayKey()
}: RoutineTrackerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [calendarMonth, setCalendarMonth] = useState(new Date(todayKey + 'T00:00:00'));
  const totalSteps = routine?.length || 0;
  const displayChecks = trackerByDate?.[selectedDate] || checkedSteps || {};
  const completedSteps = Object.values(displayChecks).filter(Boolean).length;
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const isToday = selectedDate === todayKey;

  const handleToggleStepWithDate = (stepId: string) => {
    onToggleStep(stepId, selectedDate);
  };

  const handleResetDayWithDate = () => {
    onResetDay(selectedDate);
  };

  // Calendar generation
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
    const dateStr = date.toLocaleDateString('en-CA');
    setSelectedDate(dateStr);
    setShowCalendar(false);
  };

  const daysInMonth = getDaysInMonth(calendarMonth);
  const firstDay = getFirstDayOfMonth(calendarMonth);
  
  
  const calendarDays: (number | null)[] = [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
  ];

  return (
    <>
      <section className="rounded-3xl border border-white dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 backdrop-blur-xl transition-colors duration-300">
        <div className="mb-5 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-1 items-center gap-3 transition hover:opacity-80 group"
            title="Chọn ngày"
          >
            <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 p-2.5 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100/50 dark:border-emerald-800/50 group-hover:scale-105 transition-transform">
              <CalendarCheck size={20} strokeWidth={2.5} />
            </div>
            <div className="text-left">
              <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 transition-colors">{isToday ? 'Routine tracker' : 'Lịch sử'}</h2>
              <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 transition-colors">
                {isToday ? `${completedSteps}/${totalSteps} bước hôm nay` : formatDateDisplay(selectedDate)}
              </p>
            </div>
          </button>
          {totalSteps > 0 && (
            <button
              type="button"
              onClick={handleResetDayWithDate}
              className="rounded-full p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              title="Reset ngày này"
            >
              <RotateCcw size={18} />
            </button>
          )}
        </div>

      <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-linear-to-r from-teal-400 to-emerald-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {totalSteps === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/40 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center mt-2 relative overflow-hidden transition-colors"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-emerald-50/50 dark:from-teal-900/10 dark:to-emerald-900/10 pointer-events-none" />
          <div className="w-16 h-16 mb-4 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center animate-float relative z-10 border border-teal-50 dark:border-slate-700 transition-colors">
            <Sparkles className="text-teal-400 dark:text-teal-500" size={28} />
          </div>
          <p className="text-[14px] font-medium leading-relaxed text-slate-500 dark:text-slate-400 relative z-10 max-w-[200px] transition-colors">
            Chưa có routine nào. Hãy tạo routine từ skin profile để bắt đầu theo dõi.
          </p>
        </motion.div>
      ) : (
        <div className="max-h-80 space-y-2.5 overflow-y-auto pr-1">
          <AnimatePresence>
            {routine.map((step, index) => {
              const stepId = `${step.phase}-${step.stepNumber}-${step.title}-${index}`;
              const isDone = Boolean(displayChecks?.[stepId]);
              const isMorning = String(step.phase).toLowerCase().includes('sang') || String(step.phase).toLowerCase().includes('morning');

              return (
                  <motion.button
                  key={stepId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  type="button"
                  onClick={() => handleToggleStepWithDate(stepId)}
                  className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-300 ${
                    isDone
                      ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/80 dark:bg-emerald-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-teal-300 dark:hover:border-teal-600 hover:shadow-[0_4px_12px_rgb(0,0,0,0.03)] dark:hover:shadow-black/20 hover:-translate-y-0.5'
                  }`}
                >
                  <span className={`mt-0.5 transition-colors ${isDone ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>
                    {isDone ? <CheckCircle2 size={20} className="drop-shadow-sm" /> : <Circle size={20} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      {isMorning ? <Sun size={14} className="text-amber-500 dark:text-amber-400" /> : <Moon size={14} className="text-indigo-400 dark:text-indigo-400" />}
                      {step.phase} - bước {step.stepNumber}
                    </span>
                    <span className={`block text-[15px] font-bold transition-colors ${isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {step.title}
                    </span>
                    {step.productName && (
                      <span className={`mt-1 block truncate text-[13px] font-medium ${isDone ? 'text-emerald-600/60 dark:text-emerald-500/60' : 'text-teal-600 dark:text-teal-400'}`}>{step.productName}</span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </section>

    {/* Calendar Modal */}
    {showCalendar && createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 dark:bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
        <div className="rounded-3xl border border-white dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-2xl shadow-teal-900/10 dark:shadow-black/40 max-w-sm w-full relative transition-colors duration-300">
          {/* Modal Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[17px] font-extrabold text-slate-800 dark:text-slate-100">Chọn ngày theo dõi</h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="rounded-full bg-slate-100 dark:bg-slate-700 p-2 text-slate-400 dark:text-slate-300 transition hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400"
            >
              <X size={20} />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="mb-5 flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-2 border border-slate-100 dark:border-slate-700 transition-colors">
            <button
              onClick={handlePrevMonth}
              className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 hover:shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <h4 className="text-[15px] font-extrabold text-teal-700 dark:text-teal-400 capitalize">
              {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={handleNextMonth}
              className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 transition hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100 hover:shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Day headers */}
            {['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div key={day} className="text-center text-[12px] font-extrabold text-slate-400 dark:text-slate-500 pb-2">
                {day}
              </div>
            ))}
            {/* Calendar days */}
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="aspect-square" />;
              }
              const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
              const dateStr = date.toLocaleDateString('en-CA');
              const isSelected = dateStr === selectedDate;
              const isCurrentDay = dateStr === todayKey;
              const hasData = trackerByDate?.[dateStr] && Object.values(trackerByDate[dateStr]).some(Boolean);

              return (
                <button
                  key={day}
                  onClick={() => handleSelectDate(day)}
                  className={`aspect-square rounded-2xl text-[14px] font-bold transition-all duration-200 ${
                    isSelected
                      ? 'bg-linear-to-br from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/40 dark:shadow-teal-900/60 scale-105 z-10'
                      : isCurrentDay
                      ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 ring-1 ring-teal-200 dark:ring-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/50'
                      : hasData
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                      : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                setSelectedDate(todayKey);
                setShowCalendar(false);
              }}
              className="flex-1 rounded-2xl bg-teal-50 dark:bg-teal-900/30 px-4 py-3 text-[14px] font-extrabold text-teal-700 dark:text-teal-400 transition hover:bg-teal-100 dark:hover:bg-teal-900/50"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setShowCalendar(false)}
              className="flex-1 rounded-2xl bg-slate-100 dark:bg-slate-700 px-4 py-3 text-[14px] font-extrabold text-slate-600 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}