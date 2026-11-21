import React from "react";

/**
 * ProductBottle
 * Responsible solely for rendering the glass jar image (lid, glass, jam).
 */
const ProductBottle = ({ slug, name }) => {
  return (
    <img
      src={`/images/products/${slug}-bottle.avif`}
      alt={`${name} bottle`}
      draggable="false"
      className="h-full w-full object-contain pointer-events-none select-none drop-shadow-[0_14px_24px_rgba(0,0,0,0.20)]"
    />
  );
};

export default ProductBottle;
