import React from 'react';

interface Sman2LogoProps {
  className?: string;
  size?: number | string;
  opacity?: number;
}

export default function Sman2Logo({ className = "", size = "100%", opacity = 1 }: Sman2LogoProps) {
  return (
    <svg 
      viewBox="0 0 500 500" 
      width={size} 
      height={size} 
      className={className} 
      style={{ opacity }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE082" />
          <stop offset="30%" stopColor="#FFC107" />
          <stop offset="70%" stopColor="#B58900" />
          <stop offset="100%" stopColor="#866000" />
        </linearGradient>
        
        <linearGradient id="gold-light-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF59D" />
          <stop offset="50%" stopColor="#FFD54F" />
          <stop offset="100%" stopColor="#FFB300" />
        </linearGradient>

        <linearGradient id="blue-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0B3056" />
          <stop offset="100%" stopColor="#03162B" />
        </linearGradient>

        <linearGradient id="sky-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E3F2FD" />
          <stop offset="100%" stopColor="#90CAF9" />
        </linearGradient>

        {/* Text Paths */}
        <path id="text-path-top" d="M 65 250 A 185 185 0 0 1 435 250" fill="none" />
        <path id="text-path-bottom" d="M 435 250 A 185 185 0 0 1 65 250" fill="none" />
      </defs>

      {/* 1. Outer Gold Rim */}
      <circle cx="250" cy="250" r="225" fill="url(#gold-grad)" stroke="#664D00" strokeWidth="2" />
      
      {/* 2. Outer Blue Band */}
      <circle cx="250" cy="250" r="215" fill="url(#blue-grad)" stroke="url(#gold-grad)" strokeWidth="4" />

      {/* 3. Text along path: Top (SMA NEGERI 2 KOTA PASURUAN) */}
      <text fill="#FFFFFF" fontSize="22.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="3.5">
        <textPath href="#text-path-top" startOffset="50%" textAnchor="middle">
          SMA NEGERI 2 KOTA PASURUAN
        </textPath>
      </text>

      {/* 4. Text along path: Bottom (KOTA PASURUAN - JAWA TIMUR) */}
      <text fill="#FFFFFF" fontSize="15" fontWeight="900" fontFamily="sans-serif" letterSpacing="2.5">
        <textPath href="#text-path-bottom" startOffset="50%" textAnchor="middle">
          KOTA PASURUAN - JAWA TIMUR
        </textPath>
      </text>

      {/* 5. Left & Right Gold Stars */}
      <g transform="translate(85, 250) scale(0.7)">
        <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" fill="url(#gold-grad)" stroke="#664D00" strokeWidth="1" />
      </g>
      <g transform="translate(415, 250) scale(0.7)">
        <polygon points="0,-12 3,-3 12,-3 5,3 8,12 0,6 -8,12 -5,3 -12,-3 -3,-3" fill="url(#gold-grad)" stroke="#664D00" strokeWidth="1" />
      </g>

      {/* 6. Inner Gold Ring */}
      <circle cx="250" cy="250" r="165" fill="none" stroke="url(#gold-grad)" strokeWidth="5" />
      
      {/* 7. Inner Circle with Sky/Blue Gradient background */}
      <circle cx="250" cy="250" r="160" fill="url(#sky-grad)" stroke="#ffffff" strokeWidth="1.5" />

      {/* 8. Nested Shield with Outer Gold, Inner Sky Blue, and Dark Blue Field */}
      {/* Shield Layer 1: Gold outer border */}
      <path 
        d="M 250 110 C 295 110, 355 130, 360 170 C 365 210, 350 280, 250 370 C 150 280, 135 210, 140 170 C 145 130, 205 110, 250 110 Z" 
        fill="url(#gold-grad)" 
        stroke="#4E342E" 
        strokeWidth="1.5" 
      />
      {/* Shield Layer 2: White/Sky Blue inset */}
      <path 
        d="M 250 114 C 291 114, 347 132, 352 170 C 357 204, 342 270, 250 358 C 158 270, 143 204, 148 170 C 153 132, 209 114, 250 114 Z" 
        fill="#E3F2FD" 
      />
      {/* Shield Layer 3: Dark Blue inset */}
      <path 
        d="M 250 118 C 287 118, 339 134, 344 170 C 349 200, 334 262, 250 346 C 166 262, 151 200, 156 170 C 161 134, 213 118, 250 118 Z" 
        fill="#0B3056" 
        stroke="url(#gold-grad)" 
        strokeWidth="1" 
      />

      {/* 9. Tut Wuri Handayani Symbol at top of blue shield */}
      <g transform="translate(250, 132) scale(0.45)">
        {/* Outer crest of Tut Wuri Handayani (the triangle shape) */}
        <path d="M 0 -35 L 30 15 L -30 15 Z" fill="url(#gold-light-grad)" stroke="#5D4037" strokeWidth="1.5" />
        {/* Center flame/sun */}
        <circle cx="0" cy="0" r="10" fill="#FFFFFF" stroke="url(#gold-grad)" strokeWidth="1" />
        <path d="M 0 -12 L 3 -3 L 12 -3 L 5 2 L 8 10 L 0 5 L -8 10 L -5 2 L -12 -3 L -3 -3 Z" fill="url(#gold-grad)" />
      </g>

      {/* 10. Arched "SMA" Text inside shield (exactly as the original image) */}
      <path id="sma-text-path" d="M 180 185 Q 250 152 320 185" fill="none" />
      <text fontStyle="normal" fontWeight="900" fontSize="23" fontFamily="sans-serif">
        <textPath href="#sma-text-path" startOffset="50%" textAnchor="middle" fill="#FFFFFF" stroke="#051c34" strokeWidth="2.5" paintOrder="stroke">
          SMA
        </textPath>
      </text>

      {/* 11. Stylized Wings (Left and Right) */}
      {/* Left Wing */}
      <g transform="translate(250, 235) scale(0.95)">
        <path 
          d="M -15 -10 C -45 -10, -75 -40, -85 -5 C -90 15, -70 40, -10 50 C -30 35, -50 15, -15 -10 Z" 
          fill="url(#gold-light-grad)" 
          stroke="#4E342E" 
          strokeWidth="1.5" 
        />
        <path 
          d="M -15 5 C -35 5, -55 -15, -65 10 C -70 25, -55 35, -10 40 C -25 30, -35 15, -15 5 Z" 
          fill="url(#gold-grad)" 
          stroke="#4E342E" 
          strokeWidth="1" 
        />
        <path 
          d="M -15 20 C -25 20, -35 5, -45 20 C -48 30, -38 35, -10 35 C -20 28, -25 20, -15 20 Z" 
          fill="url(#gold-grad)" 
        />
      </g>

      {/* Right Wing */}
      <g transform="translate(250, 235) scale(0.95) scale(-1, 1)">
        <path 
          d="M -15 -10 C -45 -10, -75 -40, -85 -5 C -90 15, -70 40, -10 50 C -30 35, -50 15, -15 -10 Z" 
          fill="url(#gold-light-grad)" 
          stroke="#4E342E" 
          strokeWidth="1.5" 
        />
        <path 
          d="M -15 5 C -35 5, -55 -15, -65 10 C -70 25, -55 35, -10 40 C -25 30, -35 15, -15 5 Z" 
          fill="url(#gold-grad)" 
          stroke="#4E342E" 
          strokeWidth="1" 
        />
        <path 
          d="M -15 20 C -25 20, -35 5, -45 20 C -48 30, -38 35, -10 35 C -20 28, -25 20, -15 20 Z" 
          fill="url(#gold-grad)" 
        />
      </g>

      {/* 12. Center Monument Column (Pasuruan Tugu) */}
      <g transform="translate(250, 218) scale(0.95)">
        {/* Base steps of monument */}
        <rect x="-22" y="32" width="44" height="6" fill="url(#gold-grad)" stroke="#4E342E" strokeWidth="1.5" rx="1" />
        <rect x="-16" y="24" width="32" height="8" fill="url(#gold-light-grad)" stroke="#4E342E" strokeWidth="1.5" rx="1" />
        <rect x="-10" y="14" width="20" height="10" fill="url(#gold-grad)" stroke="#4E342E" strokeWidth="1" rx="1" />
        {/* Main column */}
        <path d="M -5 14 L -3 -25 L 3 -25 L 5 14 Z" fill="url(#gold-light-grad)" stroke="#4E342E" strokeWidth="1.5" />
        {/* Peak pointer */}
        <polygon points="0,-38 -4,-25 4,-25" fill="url(#gold-grad)" stroke="#4E342E" strokeWidth="1" />
        <circle cx="0" cy="-38" r="2.5" fill="#FFE082" stroke="#4E342E" strokeWidth="1" />
      </g>

      {/* 13. Large Golden Number "2" overlaid on the center column */}
      <g transform="translate(250, 240)">
        {/* Shadow / outline border for 2 */}
        <text 
          x="0" 
          y="25" 
          fill="#3E2723" 
          fontSize="68" 
          fontWeight="900" 
          fontFamily="Georgia, serif" 
          textAnchor="middle" 
          stroke="#5D4037" 
          strokeWidth="6" 
          strokeLinejoin="round"
        >
          2
        </text>
        {/* Golden number 2 text */}
        <text 
          x="0" 
          y="25" 
          fill="url(#gold-light-grad)" 
          fontSize="68" 
          fontWeight="900" 
          fontFamily="Georgia, serif" 
          textAnchor="middle"
        >
          2
        </text>
      </g>

      {/* 14. Open Book with white pages */}
      <g transform="translate(250, 305) scale(0.95)">
        {/* Book pages */}
        <path d="M 0 10 C -15 -2, -35 -2, -50 4 L -50 20 C -35 14, -15 14, 0 25 C 15 14, 35 14, 50 20 L 50 4 C 35 -2, 15 -2, 0 10 Z" fill="#FFFFFF" stroke="#4E342E" strokeWidth="1.5" />
        <path d="M 0 11 C -15 0, -35 0, -48 5" fill="none" stroke="#B0BEC5" strokeWidth="1" />
        <path d="M 0 11 C 15 0, 35 0, 48 5" fill="none" stroke="#B0BEC5" strokeWidth="1" />
      </g>

      {/* 15. Golden Ribbon/Banner containing "PASURUAN" */}
      <g transform="translate(250, 345) scale(0.9)">
        {/* Ribbon banner */}
        <path 
          d="M -80 -10 L 80 -10 C 100 -10, 100 12, 80 12 L -80 12 C -100 12, -100 -10, -80 -10 Z" 
          fill="url(#gold-light-grad)" 
          stroke="#4E342E" 
          strokeWidth="2" 
        />
        {/* Ribbon folded corners */}
        <polygon points="-80,12 -92,20 -80,20" fill="#866000" stroke="#4E342E" strokeWidth="1" />
        <polygon points="80,12 92,20 80,20" fill="#866000" stroke="#4E342E" strokeWidth="1" />
        {/* Ribbon tails */}
        <path d="M -92 20 L -115 10 L -90 -10 Z" fill="url(#gold-grad)" stroke="#4E342E" strokeWidth="1.5" />
        <path d="M 92 20 L 115 10 L 90 -10 Z" fill="url(#gold-grad)" stroke="#4E342E" strokeWidth="1.5" />
        {/* Ribbon text */}
        <text 
          x="0" 
          y="4" 
          fill="#0D47A1" 
          fontSize="15" 
          fontWeight="bold" 
          fontFamily="sans-serif" 
          letterSpacing="2.5" 
          textAnchor="middle"
        >
          PASURUAN
        </text>
      </g>

      {/* 16. Large "DAPODIK" Blue Ribbon banner at the bottom */}
      <g transform="translate(250, 400)">
        {/* Main Ribbon Body */}
        <path 
          d="M -130 -15 L 130 -15 C 150 -15, 150 18, 130 18 L -130 18 C -150 18, -150 -15, -130 -15 Z" 
          fill="url(#blue-grad)" 
          stroke="url(#gold-grad)" 
          strokeWidth="3.5" 
        />
        {/* Folded corners */}
        <polygon points="-130,18 -145,28 -130,28" fill="#011224" stroke="url(#gold-grad)" strokeWidth="1" />
        <polygon points="130,18 145,28 130,28" fill="#011224" stroke="url(#gold-grad)" strokeWidth="1" />
        {/* Banner text: DAPODIK */}
        <text 
          x="0" 
          y="8" 
          fill="#FFFFFF" 
          fontSize="24" 
          fontWeight="900" 
          fontFamily="sans-serif" 
          letterSpacing="4" 
          textAnchor="middle"
        >
          DAPODIK
        </text>
      </g>
    </svg>
  );
}
