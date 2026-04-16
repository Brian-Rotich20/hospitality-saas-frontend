import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Package, MessageCircle, Zap } from 'lucide-react';
import type { Product } from '../../lib/types/listing';
import { resolveProductPrice } from '../../lib/types/listing';

interface ProductCardProps { product: Product; }

export function ProductCard({ product }: ProductCardProps) {
  const imageUrl = product.photos?.[0] ?? product.coverPhoto;
  const price    = resolveProductPrice(product);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const number  = product.vendor?.whatsappNumber ?? product.vendor?.phoneNumber;
    if (!number) return;
    const message = encodeURIComponent(
      product.whatsappMessage ?? `Hi, I'm interested in: ${product.title}`
    );
    const clean = number.replace(/\D/g, '').replace(/^0/, '254');
    window.open(`https://wa.me/${clean}?text=${message}`, '_blank');
  };

  return (
    <Link
      href={`/store/products/${product.id}`}
      className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden
        hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 no-underline"
    >
      {/* Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3C/svg%3E"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package size={24} className="text-gray-300" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {product.category && (
            <span className="bg-[#2D3B45]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {product.category.name}
            </span>
          )}
          {product.isDigital && (
            <span className="bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Zap size={8} /> Digital
            </span>
          )}
        </div>

        {product.vendor?.verified && (
          <span className="absolute top-2.5 right-2.5 text-[9px] font-black text-emerald-600
            bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-wide">
            Verified
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-1 group-hover:text-[#2D3B45]">
          {product.title}
        </h3>

        {product.vendor && (
          <span className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
            <MapPin size={10} className="text-gray-300 shrink-0" />
            {product.vendor.businessName}
          </span>
        )}

        {/* Variants hint */}
        {product.variants && product.variants.length > 0 && (
          <span className="text-[11px] text-gray-400">
            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} available
          </span>
        )}

        {/* Price + WhatsApp */}
        <div className="pt-2 mt-1 border-t border-gray-50 flex items-end justify-between gap-2">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Price</p>
            <p className="text-sm font-black text-[#2D3B45] leading-none">
              <span className="text-xs font-semibold text-gray-400 mr-0.5">KSh</span>
              {price.toLocaleString()}
            </p>
          </div>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1 text-[10px] font-bold text-white
              bg-[#25D366] px-2.5 py-1.5 rounded-xl hover:bg-[#1ea855] transition-colors shrink-0">
            <MessageCircle size={11} />
            Enquire
          </button>
        </div>
      </div>
    </Link>
  );
}