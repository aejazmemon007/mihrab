"use client";

import React from "react";

export type PatternVariant =
  | "andalus"
  | "noor"
  | "midnight"
  | "girih"
  | "mashrabiya"
  | "damascus";

export interface StarPatternProps {
  id: string;
  className?: string;
  variant?: PatternVariant;
  color?: string;
  strokeWidth?: number;
}

export function detectVariantFromId(id: string): PatternVariant {
  const lower = id.toLowerCase();
  if (lower.includes("sultan")) return "girih";
  if (lower.includes("madinah")) return "damascus";
  if (lower.includes("andalus") || lower.includes("zellige")) return "andalus";
  if (lower.includes("midnight") || lower.includes("hilal")) return "midnight";
  if (lower.includes("girih") || lower.includes("isfahan")) return "girih";
  if (lower.includes("mashrabiya") || lower.includes("screen")) return "mashrabiya";
  if (lower.includes("damascus") || lower.includes("levant")) return "damascus";
  return "noor";
}

/**
 * World-Class Islamic Geometric Patterns:
 * 1. andalus: Moroccan / Alhambra 8 & 16-point Zellige Interlacing Mosaic
 * 2. noor: Imperial Ottoman & Mughal Star Arabesque with floral rosettes
 * 3. midnight: Cyber-isometric Islamic hexagonal 3D cube lattice
 * 4. girih: Classical Persian Isfahan 10-point Girih star strapwork
 * 5. mashrabiya: Traditional carved wooden baluster screen lattice
 * 6. damascus: Levantine interlocking octagrams and diamond strapwork
 */
export function StarPattern({
  id,
  className,
  variant,
  color,
  strokeWidth = 1.25,
}: StarPatternProps) {
  const resolvedVariant = variant || detectVariantFromId(id);
  const patternId = id;

  function renderPatternContent() {
    switch (resolvedVariant) {
      /* =========================================================
         1. ANDALUS: Moroccan / Alhambra 8 & 16-point Zellige Mosaic
         Tessellating 80x80 Khatam-wa-Salib with Moroccan straps
         ========================================================= */
      case "andalus":
        return (
          <pattern
            id={patternId}
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--gold, #ce8930)"} strokeWidth={strokeWidth}>
              {/* Central 8-pointed star (Khatam) */}
              <rect x="27" y="27" width="26" height="26" />
              <rect x="27" y="27" width="26" height="26" transform="rotate(45 40 40)" />
              <circle cx="40" cy="40" r="6" />
              <circle cx="40" cy="40" r="19" strokeDasharray="3 3" opacity="0.6" />

              {/* 4 Corner Quarter-Stars */}
              <rect x="-13" y="-13" width="26" height="26" />
              <rect x="-13" y="-13" width="26" height="26" transform="rotate(45 0 0)" />
              <circle cx="0" cy="0" r="6" />

              <rect x="67" y="-13" width="26" height="26" />
              <rect x="67" y="-13" width="26" height="26" transform="rotate(45 80 0)" />
              <circle cx="80" cy="0" r="6" />

              <rect x="-13" y="67" width="26" height="26" />
              <rect x="-13" y="67" width="26" height="26" transform="rotate(45 0 80)" />
              <circle cx="0" cy="80" r="6" />

              <rect x="67" y="67" width="26" height="26" />
              <rect x="67" y="67" width="26" height="26" transform="rotate(45 80 80)" />
              <circle cx="80" cy="80" r="6" />

              {/* 4 Edge Half-Stars (Moroccan Zellige Interlace) */}
              <rect x="27" y="-13" width="26" height="26" transform="rotate(45 40 0)" />
              <circle cx="40" cy="0" r="5" />

              <rect x="67" y="27" width="26" height="26" transform="rotate(45 80 40)" />
              <circle cx="80" cy="40" r="5" />

              <rect x="27" y="67" width="26" height="26" transform="rotate(45 40 80)" />
              <circle cx="40" cy="80" r="5" />

              <rect x="-13" y="27" width="26" height="26" transform="rotate(45 0 40)" />
              <circle cx="0" cy="40" r="5" />

              {/* Interlocking Zellige Connecting Straps */}
              <line x1="40" y1="0" x2="40" y2="21" />
              <line x1="40" y1="59" x2="40" y2="80" />
              <line x1="0" y1="40" x2="21" y2="40" />
              <line x1="59" y1="40" x2="80" y2="40" />

              <line x1="0" y1="0" x2="22" y2="22" opacity="0.7" />
              <line x1="80" y1="0" x2="58" y2="22" opacity="0.7" />
              <line x1="0" y1="80" x2="22" y2="58" opacity="0.7" />
              <line x1="80" y1="80" x2="58" y2="58" opacity="0.7" />
            </g>
          </pattern>
        );

      /* =========================================================
         2. NOOR: Imperial Ottoman / Mughal Star Arabesque
         Tessellating 64x64 with floral rosette & quadrant arcs
         ========================================================= */
      case "noor":
        return (
          <pattern
            id={patternId}
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--gold, #c69a48)"} strokeWidth={strokeWidth}>
              {/* Central Star */}
              <rect x="20" y="20" width="24" height="24" />
              <rect x="20" y="20" width="24" height="24" transform="rotate(45 32 32)" />
              <circle cx="32" cy="32" r="5" />

              {/* 4 Corner Quarter Stars */}
              <rect x="-12" y="-12" width="24" height="24" />
              <rect x="-12" y="-12" width="24" height="24" transform="rotate(45 0 0)" />

              <rect x="52" y="-12" width="24" height="24" />
              <rect x="52" y="-12" width="24" height="24" transform="rotate(45 64 0)" />

              <rect x="-12" y="52" width="24" height="24" />
              <rect x="-12" y="52" width="24" height="24" transform="rotate(45 0 64)" />

              <rect x="52" y="52" width="24" height="24" />
              <rect x="52" y="52" width="24" height="24" transform="rotate(45 64 64)" />

              {/* Ottoman Floral Connecting Arcs */}
              <path d="M0 32 Q16 16 32 0" />
              <path d="M32 0 Q48 16 64 32" />
              <path d="M64 32 Q48 48 32 64" />
              <path d="M32 64 Q16 48 0 32" />

              <circle cx="32" cy="0" r="3" />
              <circle cx="64" cy="32" r="3" />
              <circle cx="32" cy="64" r="3" />
              <circle cx="0" cy="32" r="3" />
            </g>
          </pattern>
        );

      /* =========================================================
         3. MIDNIGHT: Cyber-Isometric Islamic Hexagonal Cube Lattice
         Tessellating 64x64 high-tech isometric diamond cubes
         ========================================================= */
      case "midnight":
        return (
          <pattern
            id={patternId}
            width="64"
            height="64"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--emerald, #00e599)"} strokeWidth={strokeWidth}>
              {/* Isometric Hexagonal Star / Cube Lattice */}
              {/* Center Diamond Cube */}
              <polygon points="32,8 48,18 32,28 16,18" />
              <polygon points="16,18 32,28 32,46 16,36" opacity="0.85" />
              <polygon points="32,28 48,18 48,36 32,46" opacity="0.65" />

              {/* Bottom Offset Diamonds */}
              <polygon points="32,46 48,56 32,66 16,56" />
              <polygon points="16,56 32,66 32,84 16,74" opacity="0.85" />
              <polygon points="32,66 48,56 48,74 32,84" opacity="0.65" />

              {/* Top & Corner Repeats */}
              <polygon points="0,0 16,10 0,20 -16,10" />
              <polygon points="64,0 80,10 64,20 48,10" />
              <polygon points="0,64 16,74 0,84 -16,74" />
              <polygon points="64,64 80,74 64,84 48,74" />

              {/* Inner Glowing Nodes */}
              <circle cx="32" cy="28" r="2.5" fill={color || "var(--emerald, #00e599)"} />
              <circle cx="0" cy="0" r="2.5" fill={color || "var(--emerald, #00e599)"} />
              <circle cx="64" cy="0" r="2.5" fill={color || "var(--emerald, #00e599)"} />
              <circle cx="0" cy="64" r="2.5" fill={color || "var(--emerald, #00e599)"} />
              <circle cx="64" cy="64" r="2.5" fill={color || "var(--emerald, #00e599)"} />
            </g>
          </pattern>
        );

      /* =========================================================
         4. GIRIH: Classical Isfahan 10-Point Girih Star Strapwork
         Tessellating 96x96 Persian Decagram Knotwork
         ========================================================= */
      case "girih":
        return (
          <pattern
            id={patternId}
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--gold, #d4af37)"} strokeWidth={strokeWidth}>
              {/* Central 10-point Decagram Geometry */}
              <polygon points="48,22 56,36 71,33 67,48 79,58 64,64 61,79 48,70 35,79 32,64 17,58 29,48 25,33 40,36" />
              <circle cx="48" cy="48" r="9" />
              <circle cx="48" cy="48" r="26" strokeDasharray="4 4" opacity="0.5" />

              {/* Radiating Corner Knot Straps */}
              <line x1="0" y1="0" x2="30" y2="30" />
              <line x1="96" y1="0" x2="66" y2="30" />
              <line x1="0" y1="96" x2="30" y2="66" />
              <line x1="96" y1="96" x2="66" y2="66" />

              {/* Edge Star Points */}
              <polygon points="48,0 54,12 48,18 42,12" />
              <polygon points="48,96 54,84 48,78 42,84" />
              <polygon points="0,48 12,54 18,48 12,42" />
              <polygon points="96,48 84,54 78,48 84,42" />
            </g>
          </pattern>
        );

      /* =========================================================
         5. MASHRABIYA: Traditional Carved Wooden Screen Lattice
         Tessellating 48x48 screen eyelets with baluster nodes
         ========================================================= */
      case "mashrabiya":
        return (
          <pattern
            id={patternId}
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--gold, #c69a48)"} strokeWidth={strokeWidth}>
              {/* Diagonal diamond eyelet screen */}
              <line x1="0" y1="24" x2="24" y2="0" />
              <line x1="24" y1="0" x2="48" y2="24" />
              <line x1="48" y1="24" x2="24" y2="48" />
              <line x1="24" y1="48" x2="0" y2="24" />

              <line x1="0" y1="24" x2="48" y2="24" opacity="0.6" />
              <line x1="24" y1="0" x2="24" y2="48" opacity="0.6" />

              {/* Turned Baluster Nodes */}
              <circle cx="24" cy="24" r="5" />
              <circle cx="24" cy="24" r="2" fill={color || "var(--gold, #c69a48)"} />

              <circle cx="0" cy="0" r="4" />
              <circle cx="48" cy="0" r="4" />
              <circle cx="0" cy="48" r="4" />
              <circle cx="48" cy="48" r="4" />

              <circle cx="24" cy="0" r="3.5" />
              <circle cx="24" cy="48" r="3.5" />
              <circle cx="0" cy="24" r="3.5" />
              <circle cx="48" cy="24" r="3.5" />
            </g>
          </pattern>
        );

      /* =========================================================
         6. DAMASCUS: Levantine Interlocking Octagrams & Diamonds
         Tessellating 72x72 Levantine Stone Inlay Geometry
         ========================================================= */
      case "damascus":
      default:
        return (
          <pattern
            id={patternId}
            width="72"
            height="72"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke={color || "var(--gold, #c69a48)"} strokeWidth={strokeWidth}>
              {/* Central Star */}
              <rect x="24" y="24" width="24" height="24" />
              <rect x="24" y="24" width="24" height="24" transform="rotate(45 36 36)" />
              <circle cx="36" cy="36" r="6" />

              {/* Interlocking Diamond Crosses */}
              <polygon points="36,0 44,12 36,24 28,12" />
              <polygon points="72,36 60,44 48,36 60,28" />
              <polygon points="36,72 44,60 36,48 28,60" />
              <polygon points="0,36 12,44 24,36 12,28" />

              {/* 4 Corner Octagram Fragments */}
              <rect x="-12" y="-12" width="24" height="24" />
              <rect x="-12" y="-12" width="24" height="24" transform="rotate(45 0 0)" />

              <rect x="60" y="-12" width="24" height="24" />
              <rect x="60" y="-12" width="24" height="24" transform="rotate(45 72 0)" />

              <rect x="-12" y="60" width="24" height="24" />
              <rect x="-12" y="60" width="24" height="24" transform="rotate(45 0 72)" />

              <rect x="60" y="60" width="24" height="24" />
              <rect x="60" y="60" width="24" height="24" transform="rotate(45 72 72)" />
            </g>
          </pattern>
        );
    }
  }

  return (
    <svg className={className} aria-hidden="true" focusable="false">
      <defs>{renderPatternContent()}</defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
