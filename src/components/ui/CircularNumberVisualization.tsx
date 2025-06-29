import React from 'react';
import { motion } from 'framer-motion';

interface NumberData {
  value: number;
  label: string;
  color?: string;
  id: string;
}

interface CircularNumberVisualizationProps {
  data: NumberData[];
  size?: number;
  className?: string;
  maxDisplayValue?: number;
  showLabels?: boolean;
  animationDelay?: number;
}

export const CircularNumberVisualization: React.FC<CircularNumberVisualizationProps> = ({
  data,
  size = 300,
  className = '',
  maxDisplayValue,
  showLabels = true,
  animationDelay = 0.1
}) => {
  // Find the maximum value to scale all numbers proportionally
  const maxValue = Math.max(...data.map(item => item.value));
  const displayMax = maxDisplayValue || maxValue;
  
  // Calculate scaling factor to fit numbers within the circle
  const scalingFactor = displayMax > 0 ? 1 / displayMax : 1;
  
  // Calculate positions for each number in a circle
  const radius = (size - 80) / 2; // Leave space for labels
  const centerX = size / 2;
  const centerY = size / 2;
  
  const getPosition = (index: number, total: number) => {
    const angle = (2 * Math.PI * index) / total - Math.PI / 2; // Start from top
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { x, y, angle };
  };

  // Calculate font size based on scaled value
  const getFontSize = (value: number) => {
    const scaledValue = value * scalingFactor;
    const minSize = 12;
    const maxSize = 32;
    const fontSize = minSize + (scaledValue * (maxSize - minSize));
    return Math.max(minSize, Math.min(maxSize, fontSize));
  };

  // Calculate circle size based on scaled value
  const getCircleSize = (value: number) => {
    const scaledValue = value * scalingFactor;
    const minSize = 30;
    const maxSize = 80;
    const circleSize = minSize + (scaledValue * (maxSize - minSize));
    return Math.max(minSize, Math.min(maxSize, circleSize));
  };

  // Default colors for different data points
  const defaultColors = [
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#84cc16', // lime
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Background circle */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 20}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2,2"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Connection lines from center */}
        {data.map((item, index) => {
          const position = getPosition(index, data.length);
          return (
            <motion.line
              key={`line-${item.id}`}
              x1={centerX}
              y1={centerY}
              x2={position.x}
              y2={position.y}
              stroke="currentColor"
              strokeWidth="1"
              className="text-gray-300 dark:text-gray-600"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5 }}
              transition={{ 
                duration: 0.8, 
                delay: index * animationDelay,
                ease: "easeOut" 
              }}
            />
          );
        })}
      </svg>

      {/* Center indicator */}
      <div 
        className="absolute w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded-full"
        style={{
          left: centerX - 8,
          top: centerY - 8,
        }}
      />

      {/* Number circles */}
      {data.map((item, index) => {
        const position = getPosition(index, data.length);
        const circleSize = getCircleSize(item.value);
        const fontSize = getFontSize(item.value);
        const color = item.color || defaultColors[index % defaultColors.length];
        
        return (
          <motion.div
            key={item.id}
            className="absolute flex flex-col items-center"
            style={{
              left: position.x - circleSize / 2,
              top: position.y - circleSize / 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.6, 
              delay: index * animationDelay + 0.3,
              type: "spring",
              stiffness: 100 
            }}
          >
            {/* Number circle */}
            <div
              className="rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              style={{
                width: circleSize,
                height: circleSize,
                backgroundColor: color,
                fontSize: `${fontSize}px`,
              }}
            >
              {item.value}
            </div>
            
            {/* Label */}
            {showLabels && (
              <motion.div
                className="mt-2 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * animationDelay + 0.6 
                }}
              >
                <div 
                  className="text-xs font-medium px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: color }}
                >
                  {item.label}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Scale indicator */}
      <div className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-full" />
          <span>Max: {displayMax}</span>
        </div>
      </div>
    </div>
  );
};