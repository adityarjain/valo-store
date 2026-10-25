import React from 'react';

interface VpIconProps {
  className?: string;
  size?: number;
}

export const VpIcon: React.FC<VpIconProps> = ({ className = 'w-4 h-4', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Valorant Points"
    >
      {/* Background outer angled diamond */}
      <polygon
        points="50,5 95,50 50,95 5,50"
        fill="url(#vp-grad-base)"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Upper left facet */}
      <polygon points="50,15 85,50 50,50 25,25" fill="url(#vp-grad-facet1)" opacity="0.9" />
      {/* Lower right facet */}
      <polygon points="50,85 15,50 50,50 75,75" fill="url(#vp-grad-facet2)" opacity="0.8" />
      {/* Center sharp emblem */}
      <polygon points="50,28 72,50 50,72 28,50" fill="#FF4655" />
      <polygon points="50,34 66,50 50,66 34,50" fill="#FFFFFF" opacity="0.9" />
      <polygon points="50,40 60,50 50,60 40,50" fill="#FF4655" />

      <defs>
        <linearGradient id="vp-grad-base" x1="5" y1="5" x2="95" y2="95" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2A3844" />
          <stop offset="0.5" stopColor="#15202B" />
          <stop offset="1" stopColor="#0B1015" />
        </linearGradient>
        <linearGradient id="vp-grad-facet1" x1="25" y1="15" x2="85" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4655" />
          <stop offset="1" stopColor="#B31F2C" />
        </linearGradient>
        <linearGradient id="vp-grad-facet2" x1="15" y1="50" x2="75" y2="85" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ECE8E1" />
          <stop offset="1" stopColor="#8A939D" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const RadianiteIcon: React.FC<VpIconProps> = ({ className = 'w-4 h-4', size = 16 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-label="Radianite Points"
    >
      <polygon points="50,8 92,50 50,92 8,50" fill="#00D692" opacity="0.2" stroke="#00D692" strokeWidth="4" />
      <polygon points="50,22 78,50 50,78 22,50" fill="#00D692" />
      <polygon points="50,35 65,50 50,65 35,50" fill="#FFFFFF" />
    </svg>
  );
};
