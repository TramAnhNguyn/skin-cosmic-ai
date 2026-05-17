import { Bot, User } from 'lucide-react';
import ProductCard from './ProductCard';
import RoutineTimeline from './RoutineTimeLine';

type Product = {
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  link: string;
};

type RoutineStep = {
  phase: string;
  stepNumber: number;
  title: string;
  productName?: string;
  instruction?: string;
};

type Message = {
  role: 'bot' | 'user';
  content: string;
  imageUrl?: string;
  products?: Product[];
  routine?: RoutineStep[];
};

export default function MessageItem({ message }: { message: Message }) {
  const isBot = message.role === 'bot';
  const products = message.products || [];
  const routine = message.routine || [];

  return (
    <div className={`mb-6 flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div
        className={`shrink-0 rounded-[20px] p-2.5 shadow-sm ${
          isBot
            ? 'bg-linear-to-br from-teal-400 to-emerald-500 text-white shadow-md shadow-teal-500/20'
            : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors'
        }`}
      >
        {isBot ? <Bot size={20} /> : <User size={20} />}
      </div>

      <div className={`flex min-w-0 flex-col ${isBot ? 'items-start' : 'items-end'}`}>
        {message.imageUrl && (
          <div
            aria-label="Uploaded skin image"
            className="mb-2 h-36 w-36 rounded-2xl border border-white/20 bg-cover bg-center shadow-md"
            style={{ backgroundImage: `url(${message.imageUrl})` }}
          />
        )}
        <div
          className={`max-w-[85%] rounded-3xl p-4.5 md:max-w-md ${
            isBot
              ? 'rounded-tl-sm border border-emerald-50/50 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-black/20 transition-colors'
              : 'rounded-tr-sm bg-linear-to-r from-teal-500 to-emerald-500 font-medium text-white shadow-md shadow-teal-500/20 dark:shadow-teal-900/40'
          }`}
        >
          <p className="whitespace-pre-line text-[15px] leading-relaxed">{message.content}</p>
        </div>

        {isBot && products.length > 0 && (
          <div className="-ml-1 flex w-full max-w-full snap-x gap-4 overflow-x-auto pb-4 pl-1 pt-4">
            {products.map((prod, index) => (
              <div key={`${prod.name}-${index}`} className="snap-start">
                <ProductCard product={prod} />
              </div>
            ))}
          </div>
        )}

        {isBot && routine.length > 0 && <RoutineTimeline routine={routine} />}
      </div>
    </div>
  );
}
