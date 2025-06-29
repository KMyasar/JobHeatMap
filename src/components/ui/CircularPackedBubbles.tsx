import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BubbleData {
  value: number;
  label: string;
  color?: string;
  id: string;
  category?: string;
}

interface CircularPackedBubblesProps {
  data: BubbleData[];
  size?: number;
  className?: string;
  maxDisplayValue?: number;
  showLabels?: boolean;
  packingDensity?: number;
}

export const CircularPackedBubbles: React.FC<CircularPackedBubblesProps> = ({
  data,
  size = 350,
  className = '',
  maxDisplayValue,
  showLabels = true,
  packingDensity = 0.8
}) => {
  // Calculate bubble sizes and positions using circle packing algorithm
  const packedBubbles = useMemo(() => {
    const maxValue = Math.max(...data.map(item => item.value));
    const displayMax = maxDisplayValue || maxValue;
    const scalingFactor = displayMax > 0 ? 1 / displayMax : 1;
    
    // Calculate bubble radii
    const bubbles = data.map((item, index) => {
      const scaledValue = item.value * scalingFactor;
      const minRadius = 15;
      const maxRadius = size * 0.15; // Max 15% of container size
      const radius = minRadius + (scaledValue * (maxRadius - minRadius));
      
      return {
        ...item,
        radius,
        x: 0,
        y: 0,
        index
      };
    });

    // Sort by radius (largest first for better packing)
    bubbles.sort((a, b) => b.radius - a.radius);

    // Simple circle packing algorithm
    const centerX = size / 2;
    const centerY = size / 2;
    const containerRadius = (size / 2) * packingDensity;

    // Place the first (largest) bubble at center
    if (bubbles.length > 0) {
      bubbles[0].x = centerX;
      bubbles[0].y = centerY;
    }

    // Place remaining bubbles
    for (let i = 1; i < bubbles.length; i++) {
      const bubble = bubbles[i];
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;

      while (!placed && attempts < maxAttempts) {
        // Try random positions within the container
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * (containerRadius - bubble.radius);
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);

        // Check if this position collides with existing bubbles
        let collision = false;
        for (let j = 0; j < i; j++) {
          const other = bubbles[j];
          const dx = x - other.x;
          const dy = y - other.y;
          const minDistance = bubble.radius + other.radius + 2; // 2px padding
          
          if (Math.sqrt(dx * dx + dy * dy) < minDistance) {
            collision = true;
            break;
          }
        }

        // Check if bubble is within container bounds
        const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (!collision && distanceFromCenter + bubble.radius <= containerRadius) {
          bubble.x = x;
          bubble.y = y;
          placed = true;
        }

        attempts++;
      }

      // If we couldn't place the bubble, place it at a fallback position
      if (!placed) {
        const angle = (i / bubbles.length) * 2 * Math.PI;
        const distance = Math.min(containerRadius - bubble.radius, containerRadius * 0.7);
        bubble.x = centerX + distance * Math.cos(angle);
        bubble.y = centerY + distance * Math.sin(angle);
      }
    }

    return bubbles;
  }, [data, size, maxDisplayValue, packingDensity]);

  // Default colors
  const defaultColors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#8b5cf6', '#ec4899', '#84cc16',
    '#f97316', '#06b6d4', '#8b5cf6', '#10b981'
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Container circle */}
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size / 2) * packingDensity}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="3,3"
          className="text-gray-200 dark:text-gray-700"
        />
      </svg>

      {/* Bubbles */}
      {packedBubbles.map((bubble, index) => {
        const color = bubble.color || defaultColors[bubble.index % defaultColors.length];
        const fontSize = Math.max(10, Math.min(16, bubble.radius / 3));
        
        return (
          <motion.div
            key={bubble.id}
            className="absolute group cursor-pointer"
            style={{
              left: bubble.x - bubble.radius,
              top: bubble.y - bubble.radius,
              width: bubble.radius * 2,
              height: bubble.radius * 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.08,
              type: "spring",
              stiffness: 100 
            }}
            whileHover={{ scale: 1.05, zIndex: 10 }}
          >
            {/* Bubble circle */}
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 group-hover:shadow-xl"
              style={{
                backgroundColor: color,
                fontSize: `${fontSize}px`,
              }}
            >
              {bubble.value}
            </div>
            
            {/* Label */}
            {showLabels && bubble.radius > 20 && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ top: bubble.radius + 2 }}
              >
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-full truncate px-1">
                  {bubble.label}
                </div>
              </div>
            )}

            {/* Tooltip for smaller bubbles */}
            {(!showLabels || bubble.radius <= 20) && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  <div className="font-semibold">{bubble.label}</div>
                  <div>Value: {bubble.value}</div>
                  {bubble.category && (
                    <div className="text-gray-300 dark:text-gray-600">{bubble.category}</div>
                  )}
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
                </div>
              </div>
            )}
          </motion.div>
        );
      })}

      {/* Stats */}
      <div className="absolute top-2 left-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="font-semibold mb-1">Statistics</div>
          <div>Items: {data.length}</div>
          <div>Total: {data.reduce((sum, item) => sum + item.value, 0)}</div>
          <div>Max: {Math.max(...data.map(item => item.value))}</div>
        </div>
      </div>
    </div>
  );
};