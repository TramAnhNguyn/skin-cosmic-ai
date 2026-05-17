import { Sun, Moon } from 'lucide-react';

type RoutineStep = {
  phase: string;
  stepNumber: number;
  title: string;
  productName?: string;
  instruction?: string;
};

export default function RoutineTimeline({ routine }: { routine: RoutineStep[] }) {
  if (!routine || routine.length === 0) return null;

  return (
    <div className="mt-4 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-50 dark:border-slate-700 rounded-3xl shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-black/20 w-full max-w-md transition-colors duration-300">
      <h3 className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2 transition-colors">
        <span>Lộ trình Skincare gợi ý</span>
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-200 before:to-transparent">
        {routine.map((step, index) => {
          const isMorning = step.phase === 'Sáng';
          
          return (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon Marker */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 transition-colors ${
                isMorning ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500 dark:text-amber-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400'
              }`}>
                {isMorning ? <Sun size={16} /> : <Moon size={16} />}
              </div>
              
              {/* Thẻ Nội dung */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4.5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isMorning ? 'text-amber-600 dark:text-amber-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                    {step.phase} - Bước {step.stepNumber}
                  </span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[14px] transition-colors">{step.title}</h4>
                {step.productName && (
                  <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 mb-2 bg-emerald-50 dark:bg-emerald-900/30 inline-block px-2.5 py-1 rounded-lg tracking-wide transition-colors">
                    {step.productName}
                  </p>
                )}
                <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">
                  {step.instruction}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
