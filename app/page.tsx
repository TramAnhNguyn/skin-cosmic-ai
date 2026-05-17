'use client';

import { useEffect, useRef, useState } from 'react';
import { Leaf, Lock, LogOut, Sparkles, Trash2, UserCircle, Moon, Sun } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
const MESSAGES_STORAGE_KEY = 'skincosmic-chat-messages';

const defaultMessages: Message[] = [
  {
    role: 'bot',
    content: 'Chào bạn! Mình là trợ lý skincare AI. Hãy tạo skin profile để mình tư vấn routine sát hơn với làn da của bạn nhé.',
    products: [],
  },
];

function getTodayKey() {
  return new Date().toLocaleDateString('en-CA');
}

export default function Home() {
  const { data: session, status } = useSession();

  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [skinProfile, setSkinProfile] = useState<SkinProfile>(defaultProfile);
  const [savedRoutine, setSavedRoutine] = useState<RoutineStep[]>([]);
  const [trackerByDate, setTrackerByDate] = useState<Record<string, Record<string, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mainScrollRef = useRef<HTMLElement>(null);

  const todayKey = getTodayKey();
  const todayChecks = trackerByDate[todayKey] || {};

  useEffect(() => {
    queueMicrotask(() => {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const storedRoutine = window.localStorage.getItem(ROUTINE_STORAGE_KEY);
      const storedTracker = window.localStorage.getItem(TRACKER_STORAGE_KEY);
      const storedMessages = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
      const storedTheme = window.localStorage.getItem('skincosmic-theme');

      if (storedTheme === 'dark') {
        setIsDark(true);
      }

      if (storedProfile) {
        setSkinProfile({ ...defaultProfile, ...JSON.parse(storedProfile) });
      }

      if (storedRoutine) {
        setSavedRoutine(JSON.parse(storedRoutine));
      }

      if (storedTracker) {
        setTrackerByDate(JSON.parse(storedTracker));
      }

      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }

      setHasLoadedStorage(true);
    });
  }, []);

  useEffect(() => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({
        top: mainScrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

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

  useEffect(() => {
    if (!hasLoadedStorage) return;
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [hasLoadedStorage, messages]);

  const handleClearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện?')) {
      setMessages(defaultMessages);
      window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
    }
  };

  const handleSignOut = async () => {
    setMessages(defaultMessages);
    window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
    await signOut();
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const newTheme = !prev;
      window.localStorage.setItem('skincosmic-theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

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
    const messageContent = userContent || `Phân tích làn da: ${image?.name || 'ảnh'}`;
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
    <div className={`flex h-[100dvh] flex-col overflow-hidden transition-colors duration-500 bg-linear-to-br from-teal-50 via-slate-50 to-emerald-50 dark:from-slate-900 dark:via-[#0b1325] dark:to-[#0f2129] font-sans ${isDark ? 'dark' : ''}`}>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-teal-200/40 dark:bg-teal-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/3 translate-y-1/3 rounded-full bg-emerald-200/40 dark:bg-emerald-500/10 blur-[80px]" />
      </div>

      <header className="relative z-20 flex items-center justify-between border-b border-teal-100/50 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4 md:px-8 transition-colors duration-300">
        <div className="flex min-w-0 items-center gap-3 md:gap-4">
          <div className="shrink-0 rounded-2xl bg-linear-to-br from-teal-400 to-emerald-500 p-2.5 text-white shadow-lg shadow-teal-500/20 sm:p-3 md:p-3.5">
            <Leaf size={20} className="hidden sm:block" strokeWidth={2.5} />
            <Leaf size={18} className="sm:hidden" strokeWidth={2.5} />
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-800 dark:text-slate-100 sm:text-xl md:text-2xl transition-colors">SkinCosmic</h1>
            <p className="truncate text-[11px] font-semibold tracking-wide text-teal-600 dark:text-teal-400 uppercase sm:text-xs transition-colors">Personal Care AI</p>
          </div>
          {messages.length > 1 && (
            <button
              onClick={handleClearChat}
              className="ml-2 flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 transition-colors hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 dark:hover:text-red-400"
              title="Xóa lịch sử trò chuyện"
            >
              <Trash2 size={14} />
              <span className="hidden sm:inline">Xóa chat</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Đổi giao diện sáng/tối"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {status === 'loading' ? (
            <div className="h-8 w-8 shrink-0 animate-spin rounded-full border-2 border-teal-100 dark:border-teal-900 border-t-teal-500 sm:h-9 sm:w-9 md:h-10 md:w-10" />
          ) : session ? (
            <div className="flex shrink-0 items-center gap-2 rounded-full border border-teal-100/50 dark:border-slate-700 bg-white/80 dark:bg-slate-800 p-1 pr-2 shadow-xs backdrop-blur-md sm:gap-3 sm:pr-3 md:pr-4 transition-colors">
              <Image
                src={session.user?.image || 'https://via.placeholder.com/150'}
                alt="Avatar"
                width={32}
                height={32}
                referrerPolicy="no-referrer"
                className="h-7 w-7 rounded-full border-2 border-white dark:border-slate-700 object-cover shadow-xs sm:h-8 sm:w-8 md:h-9 md:w-9"
              />
              <span className="hidden max-w-25 truncate text-xs font-bold text-slate-700 dark:text-slate-200 sm:inline sm:text-sm md:max-w-35 transition-colors">
                {session.user?.name}
              </span>
            <button
              onClick={handleSignOut}
              className="ml-1 shrink-0 rounded-full p-1.5 text-slate-400 transition-colors duration-200 hover:bg-red-50 hover:text-red-500"
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
        </div>
      </header>

      <main ref={mainScrollRef} className="relative z-10 grow overflow-y-auto">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="relative space-y-5 lg:sticky lg:top-4 lg:self-start">
            {!session && status !== 'loading' && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-white/80 dark:bg-slate-900/80 p-6 text-center backdrop-blur-md border border-white dark:border-slate-800 shadow-xl shadow-teal-900/5 dark:shadow-black/20 transition-colors">
                <div className="mb-4 rounded-full bg-teal-50 dark:bg-teal-900/30 p-4 text-teal-600 dark:text-teal-400 shadow-sm transition-colors">
                  <Lock size={28} />
                </div>
                <h3 className="mb-2 text-base font-extrabold text-slate-800 dark:text-slate-100 transition-colors">Cá nhân hóa chu trình</h3>
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400 px-4 transition-colors">Đăng nhập để tạo hồ sơ da và nhận routine được thiết kế riêng cho bạn.</p>
                <button
                  onClick={() => signIn('google')}
                  className="rounded-2xl bg-slate-900 dark:bg-slate-700 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 dark:shadow-slate-900/50 transition-all hover:scale-105 hover:bg-slate-800 dark:hover:bg-slate-600 active:scale-95"
                >
                  Bắt đầu ngay
                </button>
              </div>
            )}
            <div className={`space-y-4 transition-all duration-300 ${!session && status !== 'loading' ? 'pointer-events-none opacity-40 select-none blur-[1px]' : ''}`}>
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
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mx-auto w-full max-w-3xl">
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                <AnimatePresence initial={false}>
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: 'easeOut', delay: index === messages.length - 1 ? 0.1 : 0 }}
                    >
                      <MessageItem message={msg} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 flex items-start gap-3 sm:mb-8 sm:gap-4"
                  >
                    <div className="shrink-0 rounded-[20px] bg-gradient-to-br from-teal-400 to-emerald-500 border border-emerald-100 p-2.5 text-white shadow-md sm:p-3">
                      <Sparkles size={18} className="hidden sm:block animate-pulse" />
                      <Sparkles size={16} className="sm:hidden animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-white dark:bg-slate-800 px-5 py-4 shadow-[0_4px_15px_rgb(0,0,0,0.03)] dark:shadow-[0_4px_15px_rgb(0,0,0,0.2)] sm:gap-3 sm:px-6 glowing-border transition-colors">
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-400" style={{ animationDuration: '1s' }} />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-400 delay-100" style={{ animationDuration: '1s', animationDelay: '0.2s' }} />
                      <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-teal-300 delay-200" style={{ animationDuration: '1s', animationDelay: '0.4s' }} />
                    </div>
                  </motion.div>
                )}
                {/* Scroll target removed, handled by main container */}
              </div>
            </div>
          </section>
        </div>
      </main>

      <div className="relative z-20 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl transition-colors">
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
      `}</style>
    </div>
  );
}
