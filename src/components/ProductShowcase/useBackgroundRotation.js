import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * useBackgroundRotation
 * Controls the circular orange background typography rotation:
 * - Continuously rotates even when the user is idle
 * - Accelerates rotation speed when user scrolls
 * - Rotates in one direction on downward scroll
 * - Reverses direction on upward scroll
 * - Velocity responds naturally and energetically to scroll speed
 * - Smoothly returns to idle speed when scrolling stops
 */
export const useBackgroundRotation = ({ circleRef }) => {
  const currentAngle = useRef(0);
  const scrollVelocity = useRef(0);
  const targetVelocity = useRef(0);

  useEffect(() => {
    const circle = circleRef.current;
    if (!circle) return;

    const baseSpeed = 0.22; // Steady continuous idle rotation speed

    const onWheel = (e) => {
      // Delta: positive for scroll down, negative for scroll up
      const dir = Math.sign(e.deltaY);
      const mag = Math.min(Math.abs(e.deltaY), 120);
      // Energetic speed boost when scrolling
      targetVelocity.current += dir * mag * 0.055;
    };

    window.addEventListener("wheel", onWheel, { passive: true });

    const tickerCallback = (time, deltaTime) => {
      const timeFactor = Math.min(deltaTime / 16.667, 2.5);

      // Smooth lerp toward target velocity with gentle damping
      scrollVelocity.current += (targetVelocity.current - scrollVelocity.current) * 0.12;
      targetVelocity.current *= 0.88;

      // Positive on downward scroll, negative on upward scroll (reversing rotation)
      const effectiveSpeed = (baseSpeed + scrollVelocity.current) * timeFactor;
      currentAngle.current += effectiveSpeed;

      // Rotate around the SVG center coordinate (703.5px, 430px)
      circle.setAttribute(
        "transform",
        `rotate(${currentAngle.current.toFixed(2)}, 703.5, 430)`
      );
    };

    gsap.ticker.add(tickerCallback);

    return () => {
      window.removeEventListener("wheel", onWheel);
      gsap.ticker.remove(tickerCallback);
    };
  }, [circleRef]);
};
