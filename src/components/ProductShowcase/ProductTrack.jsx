import React from "react";
import ProductCard from "./ProductCard";

/**
 * ProductTrack
 * Renders the container holding all product card wrappers.
 * useHorizontalScroll dynamically updates each .product-card-wrapper in 3D screen space
 * along the arched mound with seamless infinite wrapping on both sides.
 */
const ProductTrack = ({ trackRef, products }) => {
  return (
    <div
      ref={trackRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none"
    >
      {products.map((product, index) => (
        <div
          key={`${product.slug}-${index}`}
          className="product-card-wrapper absolute top-0 left-0 will-change-transform pointer-events-auto"
          style={{
            transform: "translate3d(-9999px, -9999px, 0)",
          }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
};

export default ProductTrack;
