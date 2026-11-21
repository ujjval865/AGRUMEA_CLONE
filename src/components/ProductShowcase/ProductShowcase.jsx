import React, { useRef } from "react";
import ProductBackground from "./ProductBackground";
import ProductHeading from "./ProductHeading";
import ProductTrack from "./ProductTrack";
import { useHorizontalScroll } from "./useHorizontalScroll";
import { useBackgroundRotation } from "./useBackgroundRotation";

// All 9 products ordered with Pere centered initially, flanked by Mennulata and Smeraldo
const baseProducts = [
  { name: "Mennulata", slug: "mennulata" },
  { name: "Pere", slug: "pere" },
  { name: "Smeraldo", slug: "smeraldo" },
  { name: "Arance", slug: "arance" },
  { name: "Pesto", slug: "pesto" },
  { name: "Cipolla", slug: "cipolla" },
  { name: "Fragole", slug: "fragole" },
  { name: "Gelsineri", slug: "gelsineri" },
  { name: "Sinfonia", slug: "sinfonia" },
];

// Duplicate product list to ensure endless infinite scrolling on both sides
const products = [...baseProducts, ...baseProducts];

/**
 * ProductShowcase
 * Main orchestrator component:
 * - 100% screen-contained, zero overflow-x and zero overflow-y
 * - Arched burgundy mound background with rotating typography strictly clipped inside
 * - Seamless infinite product track on both sides with physical tilt, scale, and arc drop
 */
const ProductShowcase = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize infinite scroll physics on both sides (initialIndex = 1 centers 'Pere')
  useHorizontalScroll({ sectionRef, trackRef, initialIndex: 1 });

  // Initialize continuous + scroll-velocity-boosted background rotation
  useBackgroundRotation({ circleRef });

  return (
    <main
      ref={sectionRef}
      className="relative h-screen w-screen overflow-hidden bg-[#F6EAE2] select-none"
    >
      {/* 1. Burgundy Background with Strictly Clipped Circular Typography */}
      <ProductBackground circleRef={circleRef} />

      {/* 2. Unobtrusive Section Heading / Positioning */}
      <ProductHeading />

      {/* 3. Seamless Infinite Product Track on Both Sides */}
      <ProductTrack trackRef={trackRef} products={products} />
    </main>
  );
};

export default ProductShowcase;
