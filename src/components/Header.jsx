import { useState } from "react";

function Header() {
  const [activeLanguage, setActiveLanguage] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const menuLabel = menuOpen ? "CLOSE" : "MENU";

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <header className="relative h-[210px] w-full bg-[#F8F5EF] max-md:h-[165px] max-sm:h-[135px]">

      {/* LEFT: LANGUAGE SELECTOR */}
      <div className="absolute left-[2.35%] top-[28px] z-10 flex items-center gap-[1px] max-md:top-[24px] max-sm:top-[18px]">

        {["IT", "EN"].map((language) => (
          <button
            key={language}
            type="button"
            onClick={() => setActiveLanguage(language)}
            aria-pressed={activeLanguage === language}
            className={`flex h-[40px] w-[40px] items-center justify-center rounded-full border font-['IvyStyle'] text-[18px] font-semibold transition-all duration-300 max-md:h-[43px] max-md:w-[43px] max-md:text-[16px] max-sm:h-[36px] max-sm:w-[36px] max-sm:text-[13px] ${
              activeLanguage === language
                ? "border-[#E94E1B] bg-[#E94E1B] text-[#F8F5EF]"
                : "border-[#762530] bg-transparent text-[#762530] hover:bg-[#762530] hover:text-[#F8F5EF]"
            }`}
          >
            {language}
          </button>
        ))}
      </div>

      {/* CENTER: AGRUMEA LOGO */}
      <a
        href="/"
        aria-label="Agrumea Farm Home"
        className="absolute left-1/2 top-[28px] z-10 block w-[140px] -translate-x-1/2 max-md:top-[24px] max-md:w-[120px] max-sm:top-[18px] max-sm:w-[90px]"
      >
        <img
          src="/images/agrumea-logo.svg"
          alt="Agrumea Farm"
          className="block h-auto w-full object-contain"
        />
      </a>

      {/* RIGHT: MENU PARENT WRAPPER */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="absolute right-[2.1%] top-[28px] z-10 flex items-center bg-transparent max-md:top-[24px] max-sm:top-[18px]"
      >

        {/* MENU TEXT BUTTON */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="relative flex h-[40px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-[#762530] bg-transparent font-['IvyStyle'] text-[18px] font-semibold text-[#762530] max-md:h-[43px] max-md:w-[100px] max-md:text-[16px] max-sm:h-[36px] max-sm:w-[82px] max-sm:text-[13px]"
        >
          {/* TEXT VIEWPORT */}
          <span className="absolute inset-0 overflow-hidden">

            {/* FIRST TEXT */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isHovered ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              {menuLabel}
            </span>

            {/* SECOND TEXT */}
            <span
              className={`absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] ${
                isHovered ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {menuLabel}
            </span>

          </span>
        </button>

        {/* ORANGE CIRCLE */}
        <button
          type="button"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full transition-colors duration-300 max-md:h-[43px] max-md:w-[43px] max-sm:h-[36px] max-sm:w-[36px] ${
            isHovered ? "bg-[#762530]" : "bg-[#E94E1B]"
          }`}
        >
          {/* WHITE DIAMOND */}
          <span
            className={`h-[9px] w-[9px] rotate-45 bg-[#F8F5EF] transition-transform duration-500 max-sm:h-[7px] max-sm:w-[7px] ${
              menuOpen ? "rotate-[135deg]" : ""
            }`}
          />
        </button>

      </div>
    </header>
  );
}

export default Header;
