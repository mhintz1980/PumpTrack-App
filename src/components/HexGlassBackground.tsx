'use client';

import React from 'react';

interface HexGlassBackgroundProps {
  children?: React.ReactNode;
}

const HexGlassBackground: React.FC<HexGlassBackgroundProps> = ({ children }) => {
  // Configuration values as specified
  const HEX_SIZE = 120; // Slightly larger hexagons
  const OUTLINE_RATIO = 0.65; // Ratio of hexagons that get golden outlines
  const BLUE = "#0A235D"; // Deeper, richer navy blue
  const GOLD = "#DAA520"; // Muted, elegant gold

  // Calculate hexagon dimensions
  const hexWidth = HEX_SIZE * 2;
  const hexHeight = HEX_SIZE * Math.sqrt(3);
  const hexRadius = HEX_SIZE;

  // Generate hexagon path
  const generateHexPath = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return `M ${points.join(' L ')} Z`;
  };

  // Generate hexagon grid
  const generateHexGrid = () => {
    const hexagons = [];
    const cols = Math.ceil(window.innerWidth / (hexWidth * 0.75)) + 2;
    const rows = Math.ceil(window.innerHeight / hexHeight) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth * 0.55; // Further increased spacing between columns
        const y = row * hexHeight + (col % 2) * (hexHeight / 2);
        
        // Determine if this hex should have gold outline based on ratio
        const hasGoldOutline = Math.random() < OUTLINE_RATIO;
        
        hexagons.push({
          id: `hex-${row}-${col}`,
          path: generateHexPath(x, y, hexRadius),
          hasGoldOutline,
          x,
          y
        });
      }
    }
    
    return hexagons;
  };

  // Use a fixed grid for SSR compatibility
  const getStaticHexGrid = () => {
    const hexagons = [];
    const cols = 20; // Reasonable default for most screens
    const rows = 15;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * hexWidth * 0.55; // Further increased spacing between columns
        const y = row * hexHeight + (col % 2) * (hexHeight / 2);
        
        // Use deterministic pattern for gold outlines
        const hasGoldOutline = ((row + col) * 7) % 100 < (OUTLINE_RATIO * 100);
        
        hexagons.push({
          id: `hex-${row}-${col}`,
          path: generateHexPath(x, y, hexRadius),
          hasGoldOutline,
          x,
          y
        });
      }
    }
    
    return hexagons;
  };

  const hexagons = getStaticHexGrid();

  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `linear-gradient(315deg, #1A3A6C 0%, ${BLUE} 50%, #0f172a 100%)`
        }}
      />
      
      {/* Hexagonal Grid SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4))',
        }}
        viewBox="0 0 1500 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Solid blue with subtle polished effect */}
          <linearGradient id="bluePolished" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="1" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="1" />
          </linearGradient>
          
          {/* Subtle reflective highlight */}
          <linearGradient id="reflectiveHighlight" x1="30%" y1="20%" x2="70%" y2="80%">
            <stop offset="0%" stopColor="#1A3A6C" stopOpacity="0.8" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="1" />
          </linearGradient>

          {/* Very subtle lighting effect */}
          <filter id="subtleReflection" x="0%" y="0%" width="100%" height="100%">
            <feSpecularLighting in="SourceGraphic" result="specOut"
                               specularExponent="10" lighting-color="white">
              <fePointLight x="0" y="-50" z="100"/>
            </feSpecularLighting>
            <feComposite in="SourceGraphic" in2="specOut"
                        operator="arithmetic" k1="0" k2="1" k3="0.1" k4="0"/>
          </filter>

          {/* Almost imperceptible shadow */}
          <filter id="flatShadow" x="0%" y="0%" width="100%" height="100%">
            <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" flood-opacity="0.2" flood-color="#000000"/>
          </filter>
        </defs>

        {/* Render hexagons */}
        {hexagons.map((hex) => (
          <g key={hex.id}>
            {/* Flat hexagon with polished surface */}
            <path
              d={hex.path}
              fill="url(#reflectiveHighlight)"
              stroke={hex.hasGoldOutline ? GOLD : BLUE}
              strokeWidth="0.5"
              strokeOpacity={hex.hasGoldOutline ? "0.7" : "0.2"}
              filter="url(#flatShadow)"
              style={{
                transform: `translateZ(0)`,
              }}
            />
            
            {/* Subtle gold outline only */}
            {hex.hasGoldOutline && (
              <path
                d={hex.path}
                fill="none"
                stroke={GOLD}
                strokeWidth="0.5"
                strokeOpacity="0.6"
                style={{
                  transform: `translateZ(0.1px) scale(0.99)`,
                  transformOrigin: `${hex.x}px ${hex.y}px`,
                }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Overlay for additional depth */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 70% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 30% 70%, rgba(218, 165, 32, 0.02) 0%, transparent 40%)',
          mixBlendMode: 'soft-light'
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* CSS for 3D effects */}
      <style jsx>{`
        .relative {
          perspective: 0;
        }
        
        svg {
          transform-style: flat;
        }
        
        path {
          transition: all 0.3s ease;
        }
        
        path:hover {
          transform: scale(1.01);
          filter: brightness(1.05);
        }
      `}</style>
    </div>
  );
};

export default HexGlassBackground;