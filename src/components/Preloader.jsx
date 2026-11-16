import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Preloader.css";

const Preloader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);
  const overlayRef = useRef(null);
  const percentRef = useRef(null);
  const counter = useRef({ value: 0 });
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const percentEl = percentRef.current;
    const overlayEl = overlayRef.current;

    if (!percentEl || !overlayEl) return;

    counter.current.value = 0;
    percentEl.textContent = "1%";

    const tl = gsap.timeline({
      onComplete: () => {
        document.body.style.overflow = "";
        setIsVisible(false);
        onCompleteRef.current?.();
      },
    });

    tl.to(counter.current, {
      value: 100,
      duration: 2.4,
      ease: "power2.inOut",
      onUpdate: () => {
        percentEl.textContent = `${Math.round(counter.current.value)}%`;
      },
    }).to(overlayEl, {
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      pointerEvents: "none",
    });

    return () => {
      tl.kill();
      gsap.killTweensOf([counter.current, overlayEl]);
      document.body.style.overflow = "";
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      ref={overlayRef}
      className="preloader"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading"
    >
      <span ref={percentRef} className="preloader__percent">
        1%
      </span>
    </div>
  );
};

export default Preloader;
