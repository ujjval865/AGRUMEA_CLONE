import { useEffect, useRef } from "react";

/**
 * useHorizontalScroll
 * Custom hook implementing a physics-based, frictionless infinite carousel in BOTH directions:
 * - Infinite scrolling on both sides (scroll up or down endlessly)
 * - Mouse wheel, touch swipe, mouse drag, and keyboard navigation
 * - Arched mound trajectory: dynamic tilt, scaling, arc drop, and z-index stacking
 * - Direct GPU-accelerated translate3d style updates for 120 FPS buttery smooth motion
 */
export const useHorizontalScroll = ({ sectionRef, trackRef, initialIndex = 1 }) => {
  const scrollPos = useRef(0);
  const targetScroll = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const rafId = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const cards = track.querySelectorAll(".product-card-wrapper");
    const count = cards.length;
    if (!count) return;

    // Responsive card spacing along the track
    const getSpacing = () => {
      const w = window.innerWidth;
      if (w < 640) return 260;
      if (w < 1024) return 320;
      return Math.max(w * 0.24, 360);
    };

    let spacing = getSpacing();
    let totalLoopWidth = count * spacing;

    // Initialize position so Pere (initialIndex) starts in the center
    const initScroll = initialIndex * spacing;
    scrollPos.current = initScroll;
    targetScroll.current = initScroll;

    // Handle mouse wheel (supports scroll up and down endlessly on BOTH sides)
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);
      targetScroll.current += delta * 1.5;
    };

    // Handle touch interactions (mobile / tablet swipe)
    const handleTouchStart = (e) => {
      if (!e.touches.length) return;
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!e.touches.length) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = touchStartX.current - currentX;
      const deltaY = touchStartY.current - currentY;

      // Allow either vertical swipe or horizontal swipe to navigate
      const dominantDelta = Math.abs(deltaY) > Math.abs(deltaX) ? deltaY : deltaX;
      targetScroll.current += dominantDelta * 1.8;

      touchStartX.current = currentX;
      touchStartY.current = currentY;
    };

    // Handle mouse click & drag
    const handleMouseDown = (e) => {
      if (e.target.closest("button") || e.target.closest("a")) return;
      isDragging.current = true;
      dragStartX.current = e.clientX;
    };

    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      const deltaX = dragStartX.current - e.clientX;
      targetScroll.current += deltaX * 1.6;
      dragStartX.current = e.clientX;
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    // Handle keyboard arrow keys
    const handleKeyDown = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        targetScroll.current += 180;
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        targetScroll.current -= 180;
      }
    };

    const handleResize = () => {
      spacing = getSpacing();
      totalLoopWidth = count * spacing;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    // Continuous physics render loop
    const render = () => {
      // Smooth lerping with momentum damping
      scrollPos.current += (targetScroll.current - scrollPos.current) * 0.082;

      // Subtle ambient drift when idle
      targetScroll.current += 0.20;

      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const viewportCenterX = viewportW / 2;

      // Vertical baseline for the jars on the burgundy mound:
      // Positioned below the logo with generous headroom
      const baseY = viewportW < 640 ? viewportH * 0.49 : viewportH * 0.45;
      const reach = Math.min(viewportW * 0.44, 560);

      // Position each jar along the arched trajectory in continuous infinite loop
      cards.forEach((card, index) => {
        const baseOffset = index * spacing;
        const rawDelta = baseOffset - scrollPos.current;

        // Modulo wrapping: keeps items in [-totalLoopWidth/2, +totalLoopWidth/2] infinitely
        let relX = ((rawDelta % totalLoopWidth) + totalLoopWidth) % totalLoopWidth;
        if (relX > totalLoopWidth / 2) {
          relX -= totalLoopWidth;
        }

        const screenX = viewportCenterX + relX;
        const diff = relX / reach;
        const clampedDiff = Math.max(-1.4, Math.min(1.4, diff));

        // Mound arch drop: follows the downward curve of the burgundy mound
        const arcDrop = Math.pow(Math.min(1.2, Math.abs(clampedDiff)), 1.85) * 44;

        // Dynamic tilt (leaning outward along the slope):
        // 0 deg in center; -11.5 deg on left; +11.5 deg on right
        const tilt = clampedDiff * 11.5;

        // Dynamic scale (hero in center, tapering to sides):
        const scale = Math.max(0.78, 1.08 - Math.abs(clampedDiff) * 0.22);

        // Stacking order: center jar sits on top of adjacent jars
        const zIndex = Math.round(50 - Math.abs(clampedDiff) * 30);

        // Optimization: hide off-screen elements
        const isVisible = Math.abs(relX) < viewportW * 0.65 + 350;

        card.style.transform = `translate3d(${screenX.toFixed(1)}px, ${(baseY + arcDrop).toFixed(1)}px, 0) translate(-50%, -50%) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        card.style.zIndex = zIndex;
        card.style.visibility = isVisible ? "visible" : "hidden";
      });

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [sectionRef, trackRef, initialIndex]);
};
