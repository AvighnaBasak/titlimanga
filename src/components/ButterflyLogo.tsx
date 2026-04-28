export function ButterflyLogo({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="wingLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="wingRight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#14B8A6" />
        </linearGradient>
        <linearGradient id="wingInner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>
      {/* Left upper wing */}
      <path
        d="M30 28C26 18 18 8 8 10C4 11 2 16 4 22C6 28 14 34 24 34C26 34 28 32 30 30Z"
        fill="url(#wingLeft)"
        opacity="0.9"
      />
      {/* Left lower wing */}
      <path
        d="M28 34C22 38 12 46 10 52C9 56 12 58 16 56C22 53 28 44 30 36C30 35 29 34 28 34Z"
        fill="url(#wingInner)"
        opacity="0.8"
      />
      {/* Right upper wing */}
      <path
        d="M34 28C38 18 46 8 56 10C60 11 62 16 60 22C58 28 50 34 40 34C38 34 36 32 34 30Z"
        fill="url(#wingRight)"
        opacity="0.9"
      />
      {/* Right lower wing */}
      <path
        d="M36 34C42 38 52 46 54 52C55 56 52 58 48 56C42 53 36 44 34 36C34 35 35 34 36 34Z"
        fill="url(#wingInner)"
        opacity="0.8"
      />
      {/* Body */}
      <ellipse cx="32" cy="34" rx="2" ry="10" fill="#C4B5FD" />
      {/* Antennae */}
      <path
        d="M31 25C29 20 26 17 24 16"
        stroke="#C4B5FD"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M33 25C35 20 38 17 40 16"
        stroke="#C4B5FD"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="24" cy="15.5" r="1.2" fill="#EC4899" />
      <circle cx="40" cy="15.5" r="1.2" fill="#14B8A6" />
    </svg>
  );
}

export function ButterflyDecoration({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`}>
      <ButterflyLogo size={20} className="opacity-20 animate-float" />
    </div>
  );
}
