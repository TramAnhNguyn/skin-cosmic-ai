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
    <div className="mt-4 p-5 bg-white border border-emerald-100 rounded-2xl shadow-sm w-full max-w-md">
      <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
        <span>Lộ trình Skincare gợi ý</span>
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-200 before:to-transparent">
        {routine.map((step, index) => {
          const isMorning = step.phase === 'Sáng';
          
          return (
            <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Icon Marker */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ${
                isMorning ? 'bg-amber-100 text-amber-500' : 'bg-indigo-100 text-indigo-500'
              }`}>
                {isMorning ? <Sun size={16} /> : <Moon size={16} />}
              </div>
              
              {/* Thẻ Nội dung */}
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl border border-slate-100 bg-slate-50 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isMorning ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {step.phase} - Bước {step.stepNumber}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 text-sm">{step.title}</h4>
                {step.productName && (
                  <p className="text-xs font-medium text-emerald-600 mt-1 mb-2 bg-emerald-50 inline-block px-2 py-0.5 rounded-md">
                    {step.productName}
                  </p>
                )}
                <p className="text-xs text-slate-600 leading-relaxed">
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
