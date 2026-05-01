'use client';

import { CalendarCheck, CheckCircle2, Circle, Moon, RotateCcw, Sun, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

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
  const calendarDays = Array.from({ length: firstDay }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-white/10 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="flex flex-1 items-center gap-2 transition hover:opacity-80"
            title="Chọn ngày"
          >
            <div className="rounded-xl bg-emerald-400/15 p-2 text-emerald-200">
              <CalendarCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">{isToday ? 'Routine tracker' : 'Lịch sử'}</h2>
              <p className="text-xs text-white/50">
                {isToday ? `${completedSteps}/${totalSteps} bước hôm nay` : formatDateDisplay(selectedDate)}
              </p>
            </div>
          </button>
          {totalSteps > 0 && (
            <button
              type="button"
              onClick={handleResetDayWithDate}
              className="rounded-full p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
              title="Reset ngày này"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>

      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-linear-to-r from-teal-300 to-emerald-300 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      {totalSteps === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-4 text-sm leading-relaxed text-white/55">
          Chưa có routine nào được lưu. Hãy tạo routine từ skin profile để bắt đầu theo dõi hàng ngày.
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {routine.map((step, index) => {
            const stepId = `${step.phase}-${step.stepNumber}-${step.title}-${index}`;
            const isDone = Boolean(displayChecks?.[stepId]);
            const isMorning = String(step.phase).toLowerCase().includes('sang') || String(step.phase).toLowerCase().includes('morning');

            return (
              <button
                key={stepId}
                type="button"
                onClick={() => handleToggleStepWithDate(stepId)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  isDone
                    ? 'border-emerald-300/40 bg-emerald-300/15'
                    : 'border-white/10 bg-slate-950/35 hover:border-teal-300/40'
                }`}
              >
                <span className={`mt-0.5 ${isDone ? 'text-emerald-300' : 'text-white/35'}`}>
                  {isDone ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-white/45">
                    {isMorning ? <Sun size={12} /> : <Moon size={12} />}
                    {step.phase} - bước {step.stepNumber}
                  </span>
                  <span className={`block text-sm font-semibold ${isDone ? 'text-emerald-100 line-through' : 'text-white'}`}>
                    {step.title}
                  </span>
                  {step.productName && (
                    <span className="mt-1 block truncate text-xs text-teal-200/80">{step.productName}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>

    {/* Calendar Modal */}
    {showCalendar && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-6 shadow-xl shadow-black/50 backdrop-blur-xl max-w-sm w-full">
          {/* Modal Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Chọn ngày</h3>
            <button
              onClick={() => setShowCalendar(false)}
              className="rounded-full p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Month Navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
            <h4 className="text-sm font-semibold text-white">
              {calendarMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
            </h4>
            <button
              onClick={handleNextMonth}
              className="rounded-lg p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {['Cn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-white/50 py-1">
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
                  className={`aspect-square rounded-lg text-sm font-medium transition ${
                    isSelected
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300/50'
                      : isCurrentDay
                      ? 'bg-teal-500/40 text-teal-100 border border-teal-400/50'
                      : hasData
                      ? 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 hover:bg-emerald-500/50'
                      : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => {
                setSelectedDate(todayKey);
                setShowCalendar(false);
              }}
              className="flex-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-200 transition border border-emerald-400/30 hover:bg-emerald-500/30"
            >
              Hôm nay
            </button>
            <button
              onClick={() => setShowCalendar(false)}
              className="flex-1 rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white transition border border-white/20 hover:bg-white/15"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
