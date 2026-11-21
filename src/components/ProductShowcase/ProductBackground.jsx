import React from "react";

/**
 * ProductBackground
 * Displays the burgundy arched mound background SVG with the rotating circular
 * typography strictly clipped inside the mound path, plus the "SCROLL TO DISCOVER" indicator.
 */
const ProductBackground = ({ circleRef }) => {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none">
      {/* Burgundy Arched Mound Container spanning across the viewport */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[116vw] min-w-[100vw] h-[72vh] sm:h-[75vh] md:h-[77vh] flex items-end justify-center">
        <svg
          viewBox="0 0 1407 601"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full object-fill object-bottom overflow-hidden"
          preserveAspectRatio="none"
        >
          <defs>
            <clipPath id="moundPathClip">
              <path d="M1092.77 154.666L771.547 15.0903C737.662 0.333261 699.572 -1.66555 664.332 9.40588L300.355 123.57C267.056 134.014 238.272 155.493 218.804 184.499L25.8755 471.755C7.31057 499.396 -1.78055 532.322 -0.00260312 565.609L19.5791 932.135C21.0449 959.492 29.8107 985.958 44.9219 1008.77L231.326 1290.15C248.355 1315.85 272.71 1335.83 301.258 1347.49L579.47 1461.26C605.639 1471.98 634.249 1475.22 662.122 1470.73L1019.8 1412.9C1055.18 1407.16 1087.45 1389.29 1111.03 1362.27L1361.42 1075.41C1384.66 1048.78 1398.02 1014.94 1399.23 979.627L1410.78 641.571C1411.86 609.622 1403 578.126 1385.34 551.469L1159.63 210.758C1143.23 186.005 1120.03 166.528 1092.8 154.704L1092.77 154.666Z" />
            </clipPath>
          </defs>

          {/* 1. Solid Burgundy Mound */}
          <path
            d="M1092.77 154.666L771.547 15.0903C737.662 0.333261 699.572 -1.66555 664.332 9.40588L300.355 123.57C267.056 134.014 238.272 155.493 218.804 184.499L25.8755 471.755C7.31057 499.396 -1.78055 532.322 -0.00260312 565.609L19.5791 932.135C21.0449 959.492 29.8107 985.958 44.9219 1008.77L231.326 1290.15C248.355 1315.85 272.71 1335.83 301.258 1347.49L579.47 1461.26C605.639 1471.98 634.249 1475.22 662.122 1470.73L1019.8 1412.9C1055.18 1407.16 1087.45 1389.29 1111.03 1362.27L1361.42 1075.41C1384.66 1048.78 1398.02 1014.94 1399.23 979.627L1410.78 641.571C1411.86 609.622 1403 578.126 1385.34 551.469L1159.63 210.758C1143.23 186.005 1120.03 166.528 1092.8 154.704L1092.77 154.666Z"
            fill="#762530"
          />

          {/* 2. Rotating Circular Typography - STRICTLY CLIPPED INSIDE THE BURGUNDY MOUND */}
          <g clipPath="url(#moundPathClip)">
            <g
              ref={circleRef}
              style={{
                transformOrigin: "703.5px 430px",
              }}
            >
              <image
                href="/images/backgrounds/circular-text.svg"
                x={703.5 - 425}
                y={430 - 425}
                width={850}
                height={850}
                preserveAspectRatio="xMidYMid meet"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* "SCROLL TO DISCOVER" Prompt at Bottom Center */}
      <div className="absolute bottom-5 sm:bottom-7 md:bottom-8 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <p className="font-['IvyStyle'] text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#F6EAE2]/85">
          Scroll to discover
        </p>
      </div>

      {/* Bottom Left Privacy & Cookies Link */}
      <div className="absolute bottom-5 sm:bottom-7 left-[2.35%] z-20 pointer-events-auto">
        <a
          href="/privacy"
          className="font-['IvyStyle'] text-[11px] font-normal tracking-wide text-[#762530]/50 hover:text-[#762530] transition-colors"
        >
          Privacy &amp; Cookies
        </a>
      </div>
    </div>
  );
};

export default ProductBackground;
