/* eslint-disable @next/next/no-img-element */
'use client';

import { ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Product = {
  name: string;
  brand: string;
  price: number;
  imageUrl?: string;
  link: string;
};

export default function ProductCard({ product }: { product: Product }) {
  // Biến chứa link ảnh dự phòng
  const fallbackImage = 'https://placehold.co/400x400/f8fafc/94a3b8?text=SkinCosmic';

  return (
    <div 
      // Thêm sự kiện click để mở link sản phẩm ở tab mới
      onClick={() => window.open(product.link, '_blank')}
      className="bg-white/80 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-4 shadow-[0_4px_12px_rgb(0,0,0,0.03)] dark:shadow-black/20 hover:shadow-lg transition-all duration-300 w-64 shrink-0 block group cursor-pointer hover:-translate-y-1.5"
    >
      <img
        src={product.imageUrl || fallbackImage} 
        alt={product.name} 
        referrerPolicy="no-referrer"
        className="w-full h-40 object-cover rounded-lg mb-3"
        // Thêm bắt lỗi: nếu ảnh từ API chết, tự động đổi sang ảnh dự phòng
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
          e.currentTarget.onerror = null; 
        }}
      />
      
      <div className="mb-3 h-16">
        <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1 rounded-full uppercase tracking-wide transition-colors">
          {product.brand}
        </span>
        {/* Thêm group-hover:text-teal-600 để đổi màu chữ khi trỏ chuột vào card */}
        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[14px] mt-2.5 line-clamp-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
          {product.name}
        </h4>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100/50 dark:border-slate-700 transition-colors">
        <span className="text-[15px] font-extrabold text-teal-700 dark:text-teal-400">
          {typeof product.price === 'number' 
          ? `${product.price.toLocaleString('vi-VN')} đ` 
          : 'Đang cập nhật'}
        </span>
        
        <div className="text-white bg-slate-900 dark:bg-slate-700 group-hover:bg-teal-500 dark:group-hover:bg-teal-500 p-2.5 rounded-2xl transition-all shadow-sm group-hover:scale-105">
          <ExternalLink size={16} />
        </div>
      </div>
    </div>
  );
}