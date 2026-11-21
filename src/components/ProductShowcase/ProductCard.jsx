import React, { useState } from "react";
import ProductBottle from "./ProductBottle";
import ProductLabel from "./ProductLabel";

/**
 * ProductCard
 * Represents one product unit. Combines the bottle and label,
 * and handles the interactive hover state ("DISCOVER THE PRODUCT" pill and 360 label rotation).
 */
const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative flex flex-col items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Bottle + Label Interactive Container */}
      <div className="relative flex items-center justify-center w-[170px] h-[273px] sm:w-[210px] sm:h-[337px] md:w-[240px] md:h-[386px] lg:w-[260px] lg:h-[418px] transition-transform duration-300 ease-out group-hover:scale-[1.03]">
        {/* Glass Bottle Image (lid, glass, jam) */}
        <ProductBottle slug={product.slug} name={product.name} />

        {/* 3D Cylindrical Wrapped Label (covers bottle completely edge-to-edge, rotates 360 on hover) */}
        <ProductLabel slug={product.slug} isHovered={isHovered} />

        {/* Floating "DISCOVER THE PRODUCT" Pill (visible on hover) */}
        <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-3 group-hover:translate-y-0 pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.20)] border border-[#762530]/10 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rotate-45 bg-[#E94E1B] shrink-0"></span>
            <span className="font-['IvyStyle'] text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] text-[#E94E1B] uppercase">
              Discover the product
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
