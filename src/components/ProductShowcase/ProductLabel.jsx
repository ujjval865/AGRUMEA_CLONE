import React, { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * ProductLabel
 * Renders the product label with realistic 3D cylindrical wrapping:
 * - Follows the cylindrical curvature of the jar via arcsin foreshortening
 * - Covers the jar body completely edge-to-edge (no exposed jam on left or right)
 * - Applies studio lighting, curved top/bottom elliptical perspective, and glass highlights
 * - On hover: smoothly executes a full 360-degree rotation around the cylinder's vertical axis
 * - On unhover: smoothly returns to the front-facing position
 */
const ProductLabel = ({ slug, isHovered }) => {
  const canvasRef = useRef(null);
  const rotObj = useRef({ val: 0 });
  const imgRef = useRef(null);
  const isLoadedRef = useRef(false);
  const tweenRef = useRef(null);

  // Correctly handle the filename typo in semeralda-lable.avif
  const getLabelSrc = (s) => {
    if (s === "semeralda") return "/images/products/semeralda-lable.avif";
    return `/images/products/${s}-label.avif`;
  };

  const labelSrc = getLabelSrc(slug);

  // Core cylindrical canvas render function
  const renderCylinder = (rotationVal) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !isLoadedRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const strips = 90;
    const span = 0.46; // Visible fraction of 1600px label
    const centerU = 0.50; // Center of front graphic

    const imgW = img.naturalWidth || 1600;
    const imgH = img.naturalHeight || 607;

    for (let i = 0; i < strips; i++) {
      const uCyl = ((i + 0.5) / strips) * 2 - 1;
      if (Math.abs(uCyl) > 0.995) continue;

      const theta = Math.asin(uCyl);
      let uNorm = centerU + (theta / Math.PI) * span + rotationVal;
      uNorm = ((uNorm % 1) + 1) % 1; // wrap in [0, 1)

      const sx = uNorm * imgW;
      const sw = Math.max(
        1,
        (span / Math.PI) * (2 / (strips * Math.sqrt(1 - uCyl * uCyl + 0.001))) * imgW
      );

      const dx = (i / strips) * W;
      const dw = W / strips + 0.8; // Overlap to ensure zero gaps between strips

      // Elliptical perspective curve at top and bottom of cylinder
      const curve = 0.015 * (1 - uCyl * uCyl) * H;
      const dy = curve;
      const dh = H - curve * 0.35;

      // Draw strip with wrap-around safety
      if (sx + sw <= imgW) {
        ctx.drawImage(img, sx, 0, sw, imgH, dx, dy, dw, dh);
      } else {
        const sw1 = imgW - sx;
        const sw2 = sw - sw1;
        const dw1 = (sw1 / sw) * dw;
        const dw2 = dw - dw1;
        ctx.drawImage(img, sx, 0, sw1, imgH, dx, dy, dw1, dh);
        ctx.drawImage(img, 0, 0, sw2, imgH, dx + dw1, dy, dw2, dh);
      }
    }

    // Studio Lighting & Cylinder Depth Gradient
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const darkGrad = ctx.createLinearGradient(0, 0, W, 0);
    darkGrad.addColorStop(0, "rgba(20, 14, 10, 0.42)");
    darkGrad.addColorStop(0.08, "rgba(50, 36, 30, 0.12)");
    darkGrad.addColorStop(0.30, "rgba(255, 255, 255, 1)");
    darkGrad.addColorStop(0.70, "rgba(255, 255, 255, 1)");
    darkGrad.addColorStop(0.92, "rgba(50, 36, 30, 0.12)");
    darkGrad.addColorStop(1, "rgba(20, 14, 10, 0.42)");
    ctx.fillStyle = darkGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Studio Specular Sheen
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const lightGrad = ctx.createLinearGradient(0, 0, W, 0);
    lightGrad.addColorStop(0.60, "rgba(255, 255, 255, 0)");
    lightGrad.addColorStop(0.67, "rgba(255, 255, 255, 0.16)");
    lightGrad.addColorStop(0.74, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = lightGrad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  };

  // Preload label image and setup canvas resolution
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 450;
    canvas.height = 525;

    const img = new Image();
    img.src = labelSrc;
    imgRef.current = img;

    img.onload = () => {
      isLoadedRef.current = true;
      renderCylinder(rotObj.current.val);
    };

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
    };
  }, [labelSrc]);

  // 360-degree rotation animation on hover
  useEffect(() => {
    if (!isLoadedRef.current) return;

    if (tweenRef.current) tweenRef.current.kill();

    if (isHovered) {
      // Rotate 360 degrees (0 to 1) smoothly around cylinder axis
      tweenRef.current = gsap.to(rotObj.current, {
        val: 1,
        duration: 1.8,
        ease: "power2.inOut",
        onUpdate: () => renderCylinder(rotObj.current.val),
      });
    } else {
      // Smoothly return to front-facing position (0)
      tweenRef.current = gsap.to(rotObj.current, {
        val: 0,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => renderCylinder(rotObj.current.val),
      });
    }
  }, [isHovered]);

  return (
    <div
      className="absolute pointer-events-none select-none overflow-hidden"
      style={{
        left: "50%",
        top: "24.8%",
        width: "88.6%",
        height: "63.6%",
        transform: "translateX(-50%)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block drop-shadow-[0_2px_4px_rgba(0,0,0,0.12)]"
      />
    </div>
  );
};

export default ProductLabel;
