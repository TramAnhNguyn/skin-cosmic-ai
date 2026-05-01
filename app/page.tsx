'use client';

import { useEffect, useRef, useState } from 'react';
import { Leaf, LogOut, Sparkles, UserCircle } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import ChatInput, { type ChatImage } from './components/ChatInput';
import MessageItem from './components/MessageItem';
import RoutineTracker, { type RoutineStep } from './components/RoutineTracker';
import SkinProfilePanel, { type SkinProfile } from './components/SkinProfilePanel';

type Product = {
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  link: string;
};

type Message = {
  role: 'bot' | 'user';
  content: string;
  imageUrl?: string;
  products?: Product[];
  routine?: RoutineStep[];
};

const defaultProfile: SkinProfile = {
  skinType: '',
  concerns: [],
  avoidIngredients: '',
  budget: '',
  currentProducts: '',
};

const PROFILE_STORAGE_KEY = 'skincosmic-skin-profile';
const ROUTINE_STORAGE_KEY = 'skincosmic-saved-routine';
const TRACKER_STORAGE_KEY = 'skincosmic-routine-tracker';

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function Home() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: 'Chào bạn! Mình là trợ lý skincare AI. Hãy tạo skin profile để mình tư vấn routine sát hơn với làn da của bạn nhé.',
      products: [],
    },
  ]);
  const [skinProfile, setSkinProfile] = useState<SkinProfile>(defaultProfile);
  const [savedRoutine, setSavedRoutine] = useState<RoutineStep[]>([]);
  const [trackerByDate, setTrackerByDate] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const todayKey = getTodayKey();
  const todayChecks = trackerByDate[todayKey] || {};

  useEffect(() => {
    queueMicrotask(() => {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const storedRoutine = window.localStorage.getItem(ROUTINE_STORAGE_KEY);
      const storedTracker = window.localStorage.getItem(TRACKER_STORAGE_KEY);

      if (storedProfile) {
        setSkinProfile({ ...defaultProfile, ...JSON.parse(storedProfile) });
      }

      if (storedRoutine) {
        setSavedRoutine(JSON.parse(storedRoutine));
      }

      if (storedTracker) {
        setTrackerByDate(JSON.parse(storedTracker));
      }

      setHasLoadedStorage(true);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(skinProfile));
  }, [hasLoadedStorage, skinProfile]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(ROUTINE_STORAGE_KEY, JSON.stringify(savedRoutine));
  }, [hasLoadedStorage, savedRoutine]);

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(TRACKER_STORAGE_KEY, JSON.stringify(trackerByDate));
  }, [hasLoadedStorage, trackerByDate]);

  const handleSaveProfile = () => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(skinProfile));
  };

  const handleToggleStep = (stepId: string, date?: string) => {
    const dateToUse = date || todayKey;
    setTrackerByDate((prev) => ({
      ...prev,
      [dateToUse]: {
        ...(prev[dateToUse] || {}),
        [stepId]: !(prev[dateToUse] || {})[stepId],
      },
    }));
  };

  const handleResetDay = (date?: string) => {
    const dateToUse = date || todayKey;
    setTrackerByDate((prev) => ({
      ...prev,
      [dateToUse]: {},
    }));
  };

  const handleSendMessage = async (userContent: string, image?: ChatImage) => {
    const messageContent = userContent || `Analyze skin image: ${image?.name || 'attached image'}`;
    const userMsg: Message = {
      role: 'user',
      content: messageContent,
      imageUrl: image ? `data:${image.mimeType};base64,${image.data}` : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageContent, profile: skinProfile, image }),
      });
      const data = await res.json();
      const routine = Array.isArray(data.routine) ? data.routine : [];

      if (routine.length > 0) {
        setSavedRoutine(routine);
        setTrackerByDate((prev) => ({
          ...prev,
          [todayKey]: {},
        }));
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: data.reply,
          products: data.products || [],
          routine,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          content: 'Hệ thống đang bảo trì một chút, bạn chờ xíu nha!',
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoutine = () => {
    handleSendMessage('Hãy tạo routine chăm sóc da buổi sáng và buổi tối dựa trên skin profile của tôi.');
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-white/10 bg-linear-to-b from-white/10 to-white/5 px-3 py-3 backdrop-blur-xl sm:px-4 sm:py-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3 md:gap-4">
          <div className="shrink-0 rounded-lg bg-linear-to-br from-teal-400 to-emerald-500 p-2 text-white shadow-lg shadow-teal-500/20 sm:rounded-xl sm:p-2.5 md:p-3.5">
            <Leaf size={20} className="hidden sm:block" strokeWidth={2.5} />
            <Leaf size={18} className="sm:hidden" strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl md:text-2xl">SkinCosmic</h1>
            <p className="truncate text-[10px] font-medium text-teal-200 sm:text-xs md:text-sm">Skincare AI</p>
          </div>
        </div>

        {status === 'loading' ? (
          <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-white/20 border-t-teal-400 sm:h-9 sm:w-9 md:h-10 md:w-10" />
        ) : session ? (
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2 py-1 shadow-xl shadow-black/20 backdrop-blur-md sm:gap-2 sm:px-3 md:gap-3 md:py-1.5 md:pl-4">
            <span className="hidden max-w-25 truncate text-xs font-medium text-white sm:inline sm:text-sm md:max-w-35">
              {session.user?.name}
            </span>
            <Image
              src={session.user?.image || 'https://via.placeholder.com/150'}
              alt="Avatar"
              width={32}
              height={32}
              referrerPolicy="no-referrer"
              className="h-7 w-7 rounded-full border-2 border-teal-400/50 object-cover ring-1 ring-white/20 sm:h-8 sm:w-8 md:h-9 md:w-9"
            />
            <button
              onClick={() => signOut()}
              className="shrink-0 rounded-full p-1 text-white/50 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400 sm:p-1.5"
              title="Đăng xuất"
            >
              <LogOut size={16} className="hidden sm:block" />
              <LogOut size={14} className="sm:hidden" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('google')}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-linear-to-r from-teal-500 to-emerald-500 px-3 py-2 text-xs font-semibold text-white shadow-lg shadow-teal-500/30 transition-all duration-200 hover:from-teal-400 hover:to-emerald-400 hover:shadow-teal-500/50 sm:gap-2 sm:px-4 sm:text-sm md:px-5 md:py-2.5"
          >
            <UserCircle size={16} className="hidden sm:block" />
            <UserCircle size={14} className="sm:hidden" />
            <span className="hidden sm:inline">Đăng nhập</span>
          </button>
        )}
      </header>

      <main className="relative z-10 grow overflow-y-auto">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
            <SkinProfilePanel
              profile={skinProfile}
              onChange={setSkinProfile}
              onSave={handleSaveProfile}
              onGenerateRoutine={handleGenerateRoutine}
            />
            <RoutineTracker
              routine={savedRoutine}
              checkedSteps={todayChecks}
              onToggleStep={handleToggleStep}
              onResetDay={handleResetDay}
              trackerByDate={trackerByDate}
              todayKey={todayKey}
            />
          </aside>

          <section className="min-w-0">
            <div className="mx-auto w-full max-w-3xl">
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {messages.map((msg, index) => (
                  <div key={index} className="animate-fade-in">
                    <MessageItem message={msg} />
                  </div>
                ))}
                {isLoading && (
                  <div className="mb-6 flex items-start gap-3 sm:mb-8 sm:gap-4">
                    <div className="shrink-0 rounded-full border border-teal-500/30 bg-linear-to-br from-teal-500/20 to-emerald-500/20 p-2 text-teal-400 backdrop-blur-sm sm:p-2.5 md:p-3">
                      <Sparkles size={18} className="hidden sm:block" />
                      <Sparkles size={16} className="sm:hidden" />
                    </div>
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-white/10 bg-white/5 px-4 py-3 text-xs text-white shadow-xl shadow-black/20 backdrop-blur-md sm:gap-3 sm:px-5 sm:py-4 sm:text-sm md:px-6">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-linear-to-r from-teal-400 to-emerald-400 sm:h-2.5 sm:w-2.5" />
                      <span className="delay-100 h-2 w-2 animate-bounce rounded-full bg-linear-to-r from-teal-400 to-emerald-400 sm:h-2.5 sm:w-2.5" />
                      <span className="delay-200 h-2 w-2 animate-bounce rounded-full bg-linear-to-r from-teal-400 to-emerald-400 sm:h-2.5 sm:w-2.5" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="relative z-20 border-t border-white/10 bg-linear-to-t from-white/10 to-white/5 backdrop-blur-xl">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
