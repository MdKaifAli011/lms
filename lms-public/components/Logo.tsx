import React from "react";

type LogoProps = { width?: number | string; height?: number | string; className?: string };

export default function Logo({ width = 180, height = 52, className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 260"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-label="LMSdoors Logo"
    >
      <text x="110" y="148" fontSize="96" fill="currentColor" className="text-blue-600">
        LMS
      </text>
      <path d="M 320 28 L 380 58 L 380 202 L 320 232 Z" fill="currentColor" className="text-blue-600" />
      <rect x="356" y="62" width="28" height="136" rx="6" fill="white" />
      <path
        d="M 384 64 L 418 78 A 66 66 0 0 1 448 130 L 448 130 A 66 66 0 0 1 418 182 L 384 196 Z"
        fill="currentColor"
        className="text-red-500"
      />
      <text x="465" y="148" fontSize="96" fill="currentColor" className="text-red-500">
        oors
      </text>
      <text x="480" y="200" fontSize="50" fill="currentColor" className="text-slate-600">
        .com
      </text>
    </svg>
  );
}
