'use client';

import React from 'react';

interface HexGlassBackgroundProps {
  children?: React.ReactNode;
}

const HexGlassBackground: React.FC<HexGlassBackgroundProps> = ({ children }) => {
  // Configuration values as specified
  const HEX_SIZE = 100;
  const YELLOW_RATIO = 0.35;
  const BLUE = "#358ED4";
  const YELLOW = "#FFD12B";

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
        const x = col * hexWidth * 0.75;
        const y = row * hexHeight + (col % 2) * (hexHeight / 2);
        
        // Determine if this hex should be yellow based on ratio
        const isYellow = Math.random() < YELLOW_RATIO;
        
        hexagons.push({
          id: `hex-${row}-${col}`,
          path: generateHexPath(x, y, hexRadius),
          isYellow,
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
        const x = col * hexWidth * 0.75;
        const y = row * hexHeight + (col % 2) * (hexHeight / 2);
        
        // Use deterministic pattern for yellow hexes
        const isYellow = ((row + col) * 7) % 100 < (YELLOW_RATIO * 100);
        
        hexagons.push({
          id: `hex-${row}-${col}`,
          path: generateHexPath(x, y, hexRadius),
          isYellow,
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
          background: `linear-gradient(135deg, ${BLUE} 0%, #1e3a8a 50%, #0f172a 100%)`
        }}
      />
      
      {/* Hexagonal Grid SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{
          filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))',
        }}
        viewBox="0 0 1500 1200"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Glass effect gradients */}
          <linearGradient id="blueGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BLUE} stopOpacity="0.3" />
            <stop offset="50%" stopColor={BLUE} stopOpacity="0.1" />
            <stop offset="100%" stopColor={BLUE} stopOpacity="0.05" />
          </linearGradient>
          
          <linearGradient id="yellowGlassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={YELLOW} stopOpacity="0.4" />
            <stop offset="50%" stopColor={YELLOW} stopOpacity="0.2" />
            <stop offset="100%" stopColor={YELLOW} stopOpacity="0.1" />
          </linearGradient>

          {/* 3D lighting effects */}
          <filter id="glassEffect" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1" result="blur" />
            <feSpecularLighting in="blur" result="specOut" lightingColor="white" specularConstant="1.5" specularExponent="20">
              <fePointLight x="-50" y="-50" z="200" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut2" />
            <feComposite in="SourceGraphic" in2="specOut2" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          {/* Inner glow for 3D effect */}
          <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Render hexagons */}
        {hexagons.map((hex) => (
          <g key={hex.id}>
            {/* Main hexagon with glass effect */}
            <path
              d={hex.path}
              fill={hex.isYellow ? "url(#yellowGlassGradient)" : "url(#blueGlassGradient)"}
              stroke={hex.isYellow ? YELLOW : BLUE}
              strokeWidth={hex.isYellow ? "2" : "1"}
              strokeOpacity={hex.isYellow ? "0.8" : "0.4"}
              filter="url(#glassEffect)"
              style={{
                transform: `translateZ(${hex.isYellow ? '10px' : '5px'})`,
                transformStyle: 'preserve-3d',
              }}
            />
            
            {/* Inner highlight for 3D glass effect */}
            <path
              d={hex.path}
              fill="none"
              stroke="rgba(255, 255, 255, 0.3)"
              strokeWidth="1"
              strokeDasharray={hex.isYellow ? "none" : "5,5"}
              filter="url(#innerGlow)"
              style={{
                transform: `translateZ(${hex.isYellow ? '12px' : '7px'}) scale(0.8)`,
                transformOrigin: `${hex.x}px ${hex.y}px`,
                transformStyle: 'preserve-3d',
              }}
            />
          </g>
        ))}
      </svg>

      {/* Overlay for additional depth */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          mixBlendMode: 'overlay'
        }}
      />

      {/* Content container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>

      {/* CSS for 3D effects */}
      <style jsx>{`
        .relative {
          perspective: 1000px;
        }
        
        svg {
          transform-style: preserve-3d;
        }
        
        path {
          transition: all 0.3s ease;
        }
        
        path:hover {
          transform: translateZ(15px) scale(1.05);
          filter: brightness(1.2);
        }
      `}</style>
    </div>
  );
};

export default HexGlassBackground;