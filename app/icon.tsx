import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: '#09090b',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/*
         * Two staggered diamonds forming a "sway" / wave motif.
         * The top diamond is emerald; the bottom is offset and slightly
         * lighter — together they read as motion / oscillation.
         */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          {/* Outer glow layer (soft emerald bloom) */}
          <rect
            x="6" y="1"
            width="8" height="8"
            rx="1"
            transform="rotate(45 10 5)"
            fill="#10b981"
            opacity="0.18"
          />
          {/* Top diamond — bright emerald */}
          <rect
            x="7.5" y="2.5"
            width="5" height="5"
            rx="0.5"
            transform="rotate(45 10 5)"
            fill="#10b981"
          />
          {/* Bottom diamond — offset right, slightly muted */}
          <rect
            x="9.5" y="10.5"
            width="5" height="5"
            rx="0.5"
            transform="rotate(45 12 13)"
            fill="#34d399"
            opacity="0.75"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
