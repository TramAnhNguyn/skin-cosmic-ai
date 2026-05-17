'use client';

import { type FormEvent, useRef, useState } from 'react';
import { Plus, SendHorizontal } from 'lucide-react';

export type ChatImage = {
  data: string;
  mimeType: string;
  name: string;
};

type ChatInputProps = {
  onSendMessage: (message: string, image?: ChatImage) => void;
  isLoading: boolean;
};

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<ChatImage | undefined>();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((input.trim() || selectedImage) && !isLoading) {
      onSendMessage(input.trim(), selectedImage);
      setInput('');
      setSelectedImage(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const data = result.includes(',') ? result.split(',')[1] : result;
      setSelectedImage({ data, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-t border-teal-50 dark:border-slate-800 flex items-center gap-3 sticky bottom-0 shadow-[0_-4px_20px_rgb(0,0,0,0.02)] transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={isLoading}
        onChange={(e) => handleImageChange(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={isLoading}
        onClick={() => fileInputRef.current?.click()}
        title={selectedImage ? selectedImage.name : 'Thêm ảnh da của bạn'}
        className="p-3.5 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-slate-700 rounded-full hover:bg-teal-50 dark:hover:bg-slate-700 hover:shadow-sm transition-all disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
      >
        <Plus size={20} />
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={selectedImage ? `Image added: ${selectedImage.name}` : "Nhập tình trạng da của bạn hoặc câu hỏi nhờ tư vấn (ví dụ: da mụn nhạy cảm, hoạt chất AHA là gì)..."}
        disabled={isLoading}
        className="grow p-3.5 px-5 text-slate-700 dark:text-slate-200 font-medium bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700 rounded-full focus:outline-none focus:border-teal-400 dark:focus:border-teal-500 focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 transition-all text-[15px] disabled:bg-slate-50 dark:disabled:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm"
      />
      <button 
        type="submit" 
        disabled={isLoading || (!input.trim() && !selectedImage)}
        className="p-3.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 hover:shadow-md transition-all disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
      >
        <SendHorizontal size={20} className={input.trim() || selectedImage ? "translate-x-0.5" : ""} />
      </button>
    </form>
  );
}
