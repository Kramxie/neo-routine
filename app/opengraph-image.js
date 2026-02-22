import { ImageResponse } from 'next/og';

/**
 * Default OG image for NeoRoutine
 * Rendered as a 1200×630 PNG via Next.js Edge Runtime.
 * Automatically picked up by the root metadata (url: '/opengraph-image').
 */
export const runtime = 'edge';
export const alt = 'NeoRoutine — Redesigning habits. One drop at a time.';
export const contentType = 'image/png';
export const size = { width: 1200, height: 630 };

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 45%, #075985 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Segoe UI", system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative ripple rings */}
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 520,
            height: 520,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 360,
            height: 360,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.18)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.10)',
          }}
        />

        {/* Water drop icon */}
        <div
          style={{
            width: 88,
            height: 88,
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
            marginBottom: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 44,
          }}
        >
          💧
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 800,
            color: 'white',
            letterSpacing: '-0.03em',
            marginBottom: 18,
            textShadow: '0 2px 20px rgba(0,0,0,0.2)',
          }}
        >
          NeoRoutine
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 34,
            color: 'rgba(255,255,255,0.88)',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        >
          Redesigning habits. One drop at a time.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 100,
            padding: '8px 20px',
            fontSize: 20,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          Free to start · No credit card required
        </div>
      </div>
    ),
    { ...size }
  );
}
