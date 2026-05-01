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
      className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 w-64 shrink-0 block group cursor-pointer hover:-translate-y-1"
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
        <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
          {product.brand}
        </span>
        {/* Thêm group-hover:text-primary-600 để đổi màu chữ khi trỏ chuột vào card */}
        <h4 className="font-semibold text-slate-900 text-sm mt-1 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h4>
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
        <span className="text-sm font-bold text-slate-900">
          {typeof product.price === 'number' 
          ? `${product.price.toLocaleString('vi-VN')} đ` 
          : 'Đang cập nhật'}
        </span>
        
        <div className="text-white bg-primary-500 group-hover:bg-primary-600 p-2 rounded-full transition-colors">
          <ExternalLink size={16} />
        </div>
      </div>
    </div>
  );
}