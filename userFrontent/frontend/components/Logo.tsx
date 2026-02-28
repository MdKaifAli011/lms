import React from "react";

type LogoProps = {
  width?: number | string;
  height?: number | string;
  className?: string;
};

const Logo: React.FC<LogoProps> = ({
  width = 900,
  height = 260,
  className,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 900 260"
      width={width}
      height={height}
      className={className}
      role="img"
      aria-labelledby="logoTitle"
    >
      <title id="logoTitle">LMSdoors Logo</title>

      <defs>
        <style>
          {`
            :root {
              --teal: #1f4e52;
              --blue: #2563eb;
              --red: #dc2626;
              --white: #ffffff;
              --knob-border: #d9d9d9;
            }

            @media (prefers-color-scheme: dark) {
              :root {
                --teal: #9fd6d9;
                --blue: #3b82f6;
                --red: #ef4444;
              }
            }

            text {
              font-family: "Poppins", "Inter", "Segoe UI", Arial, sans-serif;
              font-weight: 600;
              letter-spacing: -0.35px;
            }
          `}
        </style>
      </defs>

      {/* LMS */}
      <text x="110" y="148" fontSize="96" fill="var(--blue)">
        LMS
      </text>

      {/* Back slab */}
      <path
        d="M 320 28 L 380 58 L 380 202 L 320 232 Z"
        fill="var(--blue)"
      />

      {/* Inner frame */}
      <rect
        x="356"
        y="62"
        width="28"
        height="136"
        rx="6"
        fill="var(--white)"
      />

      {/* Front door — PERFECT pill end */}
      <path
        d="
          M 384 64
          L 418 78
          A 66 66 0 0 1 448 130
          L 448 130
          A 66 66 0 0 1 418 182
          L 384 196
          Z
        "
        fill="var(--red)"
      />

      {/* Knob */}
      <circle
        cx="404"
        cy="130"
        r="5"
        fill="var(--white)"
        stroke="var(--knob-border)"
        strokeWidth="1"
      />

      {/* oors */}
      <text x="465" y="148" fontSize="96" fill="var(--red)">
        oors
      </text>

      {/* .com */}
      <text x="480" y="200" fontSize="50" fill="var(--teal)">
        .com
      </text>
    </svg>
  );
};

export default Logo;
