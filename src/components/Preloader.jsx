import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./Preloader.css";

/* ---------------------------------------------
   Fruit list (original SVG proportions)
--------------------------------------------- */
const FRUIT_LIST = [
  { src: "/images/preloader/fruit-01.svg", width: 1180, height: 1416 },
  { src: "/images/preloader/fruit-02.svg", width: 816, height: 1144 },
  { src: "/images/preloader/fruit-03.svg", width: 1116, height: 1308 },
  { src: "/images/preloader/fruit-04.svg", width: 1168, height: 1864 },
  { src: "/images/preloader/fruit-05.svg", width: 1324, height: 1268 },
  { src: "/images/preloader/fruit-06.svg", width: 1116, height: 1108 },
  { src: "/images/preloader/fruit-07.svg", width: 1980, height: 2768 },
  { src: "/images/preloader/fruit-08.svg", width: 772, height: 1164 },
  { src: "/images/preloader/fruit-09.svg", width: 860, height: 1100 },
  { src: "/images/preloader/fruit-10.svg", width: 1348, height: 1452 },
  { src: "/images/preloader/fruit-11.svg", width: 1092, height: 1220 },
];

const GRAVITY = 2200; // how fast fruits fall
const BOUNCE = 0.12; // small bounce on floor / other fruits
const FRICTION = 0.96; // slows sliding
const COLLISION_LOOPS = 5; // extra passes so overlaps get fully fixed
const SLEEP_SPEED = 28; // below this speed, fruit can fall asleep
const SLEEP_FRAMES = 10; // must stay slow this many frames before sleep
const WAKE_IMPACT = 90; // hard hit needed to wake a sleeping fruit

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomFruit() {
  return FRUIT_LIST[Math.floor(Math.random() * FRUIT_LIST.length)];
}

/**
 * Agrumea-style fruit rain with simple physics:
 * - fruits collide and push each other
 * - after they settle, they "sleep" and stop shaking
 * - on mobile/tablet: stop when screen is full (no forced overlap)
 */
function createFruitRain(rainContainer) {
  let isRunning = false;
  let canSpawn = false;
  let spawnTimer = null;
  let freezeTimer = null;
  let rafId = null;
  let lastTime = 0;

  // Each item: { el, x, y, w, h, r, vx, vy, sleeping, sleepFrames }
  // x/y = CENTER of the fruit
  const fruits = [];

  function isMobile() {
    return window.innerWidth <= 480;
  }

  function isTablet() {
    return window.innerWidth > 480 && window.innerWidth <= 768;
  }

  /* Fruit size by screen — phones need bigger fruits to fill the view */
  function getDisplaySize(fruit) {
    const screenW = window.innerWidth;
    const shortest = Math.min(screenW, window.innerHeight);

    // Bigger on phone so the pile can fill the screen before preload ends
    let maxSide;
    if (isMobile()) maxSide = shortest * 0.44;
    else if (isTablet()) maxSide = shortest * 0.36;
    else maxSide = Math.min(shortest * 0.38, screenW * 0.22);

    const naturalMax = Math.max(fruit.width, fruit.height);
    const scale = maxSide / naturalMax;

    return {
      width: fruit.width * scale,
      height: fruit.height * scale,
    };
  }

  /* How many fruits this screen can hold */
  function getMaxFruits() {
    if (isMobile()) return 20;
    if (isTablet()) return 28;
    return 50;
  }

  /* True when the SETTLED pile has reached the top — stop adding more */
  function isScreenFull() {
    if (fruits.length >= getMaxFruits()) return true;
    if (fruits.length < 3) return false;

    const topLimit = window.innerHeight * (isMobile() ? 0.08 : 0.1);
    let restingNearTop = 0;

    for (let i = 0; i < fruits.length; i += 1) {
      const fruit = fruits[i];
      const almostStill =
        fruit.sleeping || Math.hypot(fruit.vx, fruit.vy) < SLEEP_SPEED;

      // Only count fruits that have landed in the pile near the top
      if (almostStill && fruit.y - fruit.r <= topLimit && fruit.y > 0) {
        restingNearTop += 1;
      }
    }

    const need = isMobile() ? 1 : 2;
    return restingNearTop >= need;
  }

  function wake(fruit) {
    fruit.sleeping = false;
    fruit.sleepFrames = 0;
  }

  function putToSleep(fruit) {
    fruit.sleeping = true;
    fruit.sleepFrames = SLEEP_FRAMES;
    fruit.vx = 0;
    fruit.vy = 0;
  }

  /* Stop rain + freeze pile (used at 100% OR when screen is already full) */
  function stopSpawning() {
    canSpawn = false;

    if (spawnTimer !== null) {
      window.clearTimeout(spawnTimer);
      spawnTimer = null;
    }

    if (freezeTimer !== null) window.clearTimeout(freezeTimer);
    freezeTimer = window.setTimeout(() => {
      fruits.forEach((fruit) => putToSleep(fruit));
      freezeTimer = null;
    }, 220);
  }

  /* Create one fruit above the screen */
  function spawnFruit() {
    if (!isRunning || !canSpawn || !rainContainer) return false;

    // Screen already full → freeze and do not force more fruits in
    if (isScreenFull()) {
      stopSpawning();
      return false;
    }

    const data = getRandomFruit();
    const { width, height } = getDisplaySize(data);
    const radius = Math.min(width, height) * 0.5;

    const el = document.createElement("img");
    el.src = data.src;
    el.alt = "";
    el.draggable = false;
    el.className = "preloader__fruit";
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    rainContainer.appendChild(el);

    const startX = randomBetween(radius + 10, window.innerWidth - radius - 10);

    const fruit = {
      el,
      w: width,
      h: height,
      r: radius,
      x: startX,
      y: -height,
      vx: randomBetween(-60, 60),
      vy: randomBetween(80, 200),
      sleeping: false,
      sleepFrames: 0,
    };

    fruits.push(fruit);
    drawFruit(fruit);
    return true;
  }

  function drawFruit(fruit) {
    gsap.set(fruit.el, {
      x: fruit.x - fruit.w / 2,
      y: fruit.y - fruit.h / 2,
      rotation: 0,
      force3D: true,
    });
  }

  /* Push overlapping fruits apart. Sleeping fruits act like solid settled pieces. */
  function resolveCollision(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = a.r + b.r;

    if (dist >= minDist) return;

    const overlap = minDist - dist;
    const nx = dx / dist;
    const ny = dy / dist;

    // Both already settled: tiny positional fix only, no movement energy
    if (a.sleeping && b.sleeping) {
      if (overlap < 0.35) return;
      const push = overlap * 0.5;
      a.x -= nx * push;
      a.y -= ny * push;
      b.x += nx * push;
      b.y += ny * push;
      return;
    }

    // One sleeping = treat it like a static wall
    if (a.sleeping && !b.sleeping) {
      b.x += nx * overlap;
      b.y += ny * overlap;

      const impact = b.vx * -nx + b.vy * -ny;
      if (impact > 0) {
        b.vx += impact * (1 + BOUNCE) * nx;
        b.vy += impact * (1 + BOUNCE) * ny;
      }
      // Only wake if screen is not already full
      if (impact > WAKE_IMPACT && !isScreenFull()) wake(a);
      return;
    }

    if (b.sleeping && !a.sleeping) {
      a.x -= nx * overlap;
      a.y -= ny * overlap;

      const impact = a.vx * nx + a.vy * ny;
      if (impact > 0) {
        a.vx -= impact * (1 + BOUNCE) * nx;
        a.vy -= impact * (1 + BOUNCE) * ny;
      }
      if (impact > WAKE_IMPACT && !isScreenFull()) wake(b);
      return;
    }

    // Both awake: push apart and share impact (bottom fruits can adjust)
    const push = overlap * 0.5;
    a.x -= nx * push;
    a.y -= ny * push;
    b.x += nx * push;
    b.y += ny * push;

    const relativeVx = a.vx - b.vx;
    const relativeVy = a.vy - b.vy;
    const impact = relativeVx * nx + relativeVy * ny;

    if (impact > 0) {
      const bounce = impact * (1 + BOUNCE) * 0.5;
      a.vx -= bounce * nx;
      a.vy -= bounce * ny;
      b.vx += bounce * nx;
      b.vy += bounce * ny;
    }
  }

  function clampToBounds(fruit, floor, wallLeft, wallRight) {
    if (fruit.y + fruit.r > floor) {
      fruit.y = floor - fruit.r;
      if (!fruit.sleeping) {
        fruit.vy *= -BOUNCE;
        fruit.vx *= 0.85;
        if (Math.abs(fruit.vy) < SLEEP_SPEED) fruit.vy = 0;
        if (Math.abs(fruit.vx) < SLEEP_SPEED) fruit.vx = 0;
      }
    }

    if (fruit.x - fruit.r < wallLeft) {
      fruit.x = wallLeft + fruit.r;
      if (!fruit.sleeping) fruit.vx *= -0.35;
    }
    if (fruit.x + fruit.r > wallRight) {
      fruit.x = wallRight - fruit.r;
      if (!fruit.sleeping) fruit.vx *= -0.35;
    }
  }

  function updatePhysics(dt) {
    const floor = window.innerHeight;
    const wallLeft = 0;
    const wallRight = window.innerWidth;

    for (let i = 0; i < fruits.length; i += 1) {
      const fruit = fruits[i];

      // Sleeping fruits stay completely still (no shake)
      if (fruit.sleeping) {
        fruit.vx = 0;
        fruit.vy = 0;
        clampToBounds(fruit, floor, wallLeft, wallRight);
        continue;
      }

      fruit.vy += GRAVITY * dt;
      fruit.x += fruit.vx * dt;
      fruit.y += fruit.vy * dt;
      fruit.vx *= FRICTION;

      clampToBounds(fruit, floor, wallLeft, wallRight);

      // If almost stopped, count frames then sleep
      const speed = Math.hypot(fruit.vx, fruit.vy);
      if (speed < SLEEP_SPEED) {
        fruit.sleepFrames += 1;
        if (fruit.sleepFrames >= SLEEP_FRAMES) {
          putToSleep(fruit);
        }
      } else {
        fruit.sleepFrames = 0;
      }
    }

    for (let loop = 0; loop < COLLISION_LOOPS; loop += 1) {
      for (let i = 0; i < fruits.length; i += 1) {
        for (let j = i + 1; j < fruits.length; j += 1) {
          resolveCollision(fruits[i], fruits[j]);
        }
      }

      for (let i = 0; i < fruits.length; i += 1) {
        clampToBounds(fruits[i], floor, wallLeft, wallRight);
      }
    }

    for (let i = 0; i < fruits.length; i += 1) {
      drawFruit(fruits[i]);
    }

    // If pile reached the top, stop forcing more fruits in
    if (canSpawn && isScreenFull()) {
      stopSpawning();
    }
  }

  function loop(time) {
    if (!isRunning) return;

    if (!lastTime) lastTime = time;
    const dt = Math.min(0.032, (time - lastTime) / 1000);
    lastTime = time;

    updatePhysics(dt);
    rafId = window.requestAnimationFrame(loop);
  }

  function scheduleSpawn() {
    if (!isRunning || !canSpawn) return;

    // Phone needs faster rain so it can fill before preload ends
    const delay = isMobile()
      ? randomBetween(70, 120)
      : isTablet()
        ? randomBetween(100, 160)
        : randomBetween(90, 160);

    spawnTimer = window.setTimeout(() => {
      if (!canSpawn) return;

      spawnFruit();

      // Extra fruit often on phone/tablet so the screen fills up
      if (isMobile() || isTablet()) {
        if (Math.random() > 0.35) spawnFruit();
      } else if (Math.random() > 0.55) {
        spawnFruit();
      }

      scheduleSpawn();
    }, delay);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    canSpawn = true;
    lastTime = 0;

    // Stronger start on phone so fill begins immediately
    const burst = isMobile() ? 4 : isTablet() ? 3 : 3;
    for (let i = 0; i < burst; i += 1) {
      spawnFruit();
    }

    scheduleSpawn();
    rafId = window.requestAnimationFrame(loop);
  }

  function destroy() {
    isRunning = false;
    canSpawn = false;

    if (spawnTimer !== null) {
      window.clearTimeout(spawnTimer);
      spawnTimer = null;
    }

    if (freezeTimer !== null) {
      window.clearTimeout(freezeTimer);
      freezeTimer = null;
    }

    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }

    fruits.forEach((fruit) => fruit.el.remove());
    fruits.length = 0;
  }

  return { start, stopSpawning, destroy };
}

const Preloader = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  const overlayRef = useRef(null);
  const percentRef = useRef(null);
  const rainRef = useRef(null);

  const counter = useRef({ value: 0 });
  const onCompleteRef = useRef(onComplete);
  const rainStartedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const percent = percentRef.current;
    const rainLayer = rainRef.current;

    if (!overlay || !percent || !rainLayer) return;

    document.body.style.overflow = "hidden";

    counter.current.value = 0;
    percent.textContent = "0%";
    rainStartedRef.current = false;

    const fruitRain = createFruitRain(rainLayer);

    const timeline = gsap.timeline({
      onComplete: () => {
        fruitRain.destroy();
        document.body.style.overflow = "";
        setIsVisible(false);
        onCompleteRef.current?.();
      },
    });

    const isSmallScreen = window.innerWidth <= 768;

    timeline
      .to(counter.current, {
        value: 100,
        // A bit longer on phone/tablet so fruits have time to fill
        duration: isSmallScreen ? 5 : 4.2,
        ease: "power2.inOut",
        onUpdate: () => {
          const currentPercent = Math.round(counter.current.value);
          percent.textContent = `${currentPercent}%`;

          // Start rain earlier on small screens
          const startAt = isSmallScreen ? 5 : 10;
          if (!rainStartedRef.current && currentPercent >= startAt) {
            rainStartedRef.current = true;
            fruitRain.start();
          }
        },
        onComplete: () => {
          fruitRain.stopSpawning();
        },
      })
      .to(overlay, {
        opacity: 0,
        duration: 0.75,
        ease: "power2.out",
        pointerEvents: "none",
      });

    return () => {
      fruitRain.destroy();
      timeline.kill();
      gsap.killTweensOf([counter.current, overlay]);
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
        0%
      </span>
      <div ref={rainRef} className="preloader__rain" aria-hidden="true" />
    </div>
  );
};

export default Preloader;
