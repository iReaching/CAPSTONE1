import React from 'react';

export default function AnimatedHamburger({ isOpen, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20 transition-all duration-200 active:scale-95 ${className}`}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center">
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-out ${
            isOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-out ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-white transition-all duration-300 ease-out ${
            isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'
          }`}
        />
      </div>
    </button>
  );
}

// Alternative: Dots style hamburger
export function DotsHamburger({ isOpen, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20 transition-all duration-200 active:scale-95 ${className}`}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <div className="w-6 h-6 flex flex-col justify-center items-center gap-1">
        <div
          className={`w-1 h-1 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'transform rotate-45 translate-y-2' : ''
          }`}
        />
        <div
          className={`w-1 h-1 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <div
          className={`w-1 h-1 bg-white rounded-full transition-all duration-300 ${
            isOpen ? 'transform -rotate-45 -translate-y-2' : ''
          }`}
        />
      </div>
    </button>
  );
}

// Alternative: Modern style hamburger
export function ModernHamburger({ isOpen, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center w-12 h-12 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30 border border-white/20 transition-all duration-200 active:scale-95 ${className}`}
      aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          className={`transition-all duration-300 ${
            isOpen ? 'opacity-0' : 'opacity-100'
          }`}
          d="M4 6h16M4 12h16M4 18h16"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          className={`transition-all duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  );
}