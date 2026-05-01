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
        className={`shrink-0 rounded-full p-2.5 shadow-sm ${
          isBot
            ? 'border border-emerald-100 bg-emerald-50 text-emerald-600'
            : 'border border-slate-100 bg-white text-slate-400'
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
          className={`max-w-[85%] rounded-2xl p-4 md:max-w-md ${
            isBot
              ? 'rounded-bl-none border border-emerald-50 bg-white text-slate-700 shadow-sm'
              : 'rounded-br-none bg-emerald-500 font-medium text-white shadow-md'
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
