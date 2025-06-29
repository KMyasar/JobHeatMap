import React from 'react';
import { motion } from 'framer-motion';

interface GridData {
  value: number;
  label: string;
  color?: string;
  id: string;
  description?: string;
}

interface CircularDataGridProps {
  data: GridData[];
  size?: number;
  className?: string;
  maxDisplayValue?: number;
  showDescriptions?: boolean;
  gridSize?: number;
}

export const CircularDataGrid: React.FC<CircularDataGridProps> = ({
  data,
  size = 400,
  className = '',
  maxDisplayValue,
  showDescriptions = false,
  gridSize = 3
}) => {
  // Find the maximum value to scale all numbers proportionally
  const maxValue = Math.max(...data.map(item => item.value));
  const displayMax = maxDisplayValue || maxValue;
  
  // Calculate scaling factor
  const scalingFactor = displayMax > 0 ? 1 / displayMax : 1;
  
  // Calculate grid positions within a circle
  const radius = (size - 100) / 2;
  const centerX = size / 2;
  const centerY = size / 2;
  
  const getGridPosition = (index: number) => {
    const totalItems = data.length;
    const itemsPerRing = Math.ceil(Math.sqrt(totalItems));
    const ring = Math.floor(index / itemsPerRing);
    const positionInRing = index % itemsPerRing;
    const itemsInThisRing = Math.min(itemsPerRing, totalItems - ring * itemsPerRing);
    
    const ringRadius = radius * (0.3 + (ring * 0.7) / Math.max(1, Math.ceil(totalItems / itemsPerRing) - 1));
    const angle = (2 * Math.PI * positionInRing) / itemsInThisRing - Math.PI / 2;
    
    const x = centerX + ringRadius * Math.cos(angle);
    const y = centerY + ringRadius * Math.sin(angle);
    
    return { x, y, ring };
  };

  // Calculate size based on scaled value and ring
  const getItemSize = (value: number, ring: number) => {
    const scaledValue = value * scalingFactor;
    const baseSize = 40 - (ring * 8); // Smaller items in outer rings
    const minSize = 20;
    const maxSize = Math.max(baseSize, minSize);
    const itemSize = minSize + (scaledValue * (maxSize - minSize));
    return Math.max(minSize, Math.min(maxSize, itemSize));
  };

  // Calculate font size
  const getFontSize = (value: number, itemSize: number) => {
    const minFont = 10;
    const maxFont = 16;
    const ratio = itemSize / 60; // Base ratio
    return Math.max(minFont, Math.min(maxFont, minFont + ratio * (maxFont - minFont)));
  };

  // Default colors
  const defaultColors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', 
    '#ef4444', '#8b5cf6', '#ec4899', '#84cc16',
    '#f97316', '#06b6d4', '#8b5cf6', '#10b981'
  ];

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg width={size} height={size} className="absolute inset-0">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius + 30}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Concentric circles for rings */}
        {[0.3, 0.6, 1.0].map((ratio, index) => (
          <circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius * ratio}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.3"
            className="text-gray-300 dark:text-gray-600"
          />
        ))}
      </svg>

      {/* Center label */}
      <div 
        className="absolute flex flex-col items-center justify-center"
        style={{
          left: centerX - 40,
          top: centerY - 20,
          width: 80,
          height: 40,
        }}
      >
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {data.length}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Items
        </div>
      </div>

      {/* Data items */}
      {data.map((item, index) => {
        const position = getGridPosition(index);
        const itemSize = getItemSize(item.value, position.ring);
        const fontSize = getFontSize(item.value, itemSize);
        const color = item.color || defaultColors[index % defaultColors.length];
        
        return (
          <motion.div
            key={item.id}
            className="absolute group cursor-pointer"
            style={{
              left: position.x - itemSize / 2,
              top: position.y - itemSize / 2,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.05,
              type: "spring",
              stiffness: 120 
            }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
          >
            {/* Item circle */}
            <div
              className="rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-all duration-200 group-hover:shadow-xl"
              style={{
                width: itemSize,
                height: itemSize,
                backgroundColor: color,
                fontSize: `${fontSize}px`,
              }}
            >
              {item.value}
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                <div className="font-semibold">{item.label}</div>
                <div>Value: {item.value}</div>
                {showDescriptions && item.description && (
                  <div className="text-gray-300 dark:text-gray-600">{item.description}</div>
                )}
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-100" />
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-gray-400 rounded-full" />
            <span>Size ∝ Value</span>
          </div>
          <div className="text-xs text-gray-400">
            Max: {displayMax}
          </div>
        </div>
      </div>
    </div>
  );
};