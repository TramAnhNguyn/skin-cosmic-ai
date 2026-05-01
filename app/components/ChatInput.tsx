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
    <form onSubmit={handleSubmit} className="p-4 bg-white/80 backdrop-blur-md border-t border-emerald-100 flex items-center gap-3 sticky bottom-0">
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
        title={selectedImage ? selectedImage.name : 'Add skin image'}
        className="p-3.5 bg-white text-emerald-600 border border-emerald-200 rounded-full hover:bg-emerald-50 hover:shadow-md transition-all disabled:bg-slate-50 disabled:text-slate-300 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
      >
        <Plus size={20} />
      </button>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={selectedImage ? `Image added: ${selectedImage.name}` : "Nhập tình trạng da của bạn hoặc câu hỏi nhờ tư vấn (ví dụ: da mụn nhạy cảm, hoạt chất AHA là gì)..."}
        disabled={isLoading}
        className="grow p-3.5 px-5 text-slate-700 bg-white border border-emerald-200 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all text-[15px] disabled:bg-slate-50 placeholder:text-slate-400 shadow-sm"
      />
      <button 
        type="submit" 
        disabled={isLoading || (!input.trim() && !selectedImage)}
        className="p-3.5 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 hover:shadow-md transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed flex-shrink-0"
      >
        <SendHorizontal size={20} className={input.trim() || selectedImage ? "translate-x-0.5" : ""} />
      </button>
    </form>
  );
}
