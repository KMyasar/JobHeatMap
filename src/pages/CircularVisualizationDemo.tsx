import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Circle, Grid3X3, RefreshCw, Plus, Minus } from 'lucide-react';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CircularNumberVisualization } from '../components/ui/CircularNumberVisualization';
import { CircularDataGrid } from '../components/ui/CircularDataGrid';
import { CircularPackedBubbles } from '../components/ui/CircularPackedBubbles';

const sampleData = [
  { id: '1', value: 85, label: 'React', color: '#61dafb', description: 'Frontend Framework' },
  { id: '2', value: 72, label: 'Python', color: '#3776ab', description: 'Programming Language' },
  { id: '3', value: 68, label: 'Node.js', color: '#339933', description: 'Runtime Environment' },
  { id: '4', value: 91, label: 'JavaScript', color: '#f7df1e', description: 'Programming Language' },
  { id: '5', value: 45, label: 'Docker', color: '#2496ed', description: 'Containerization' },
  { id: '6', value: 58, label: 'AWS', color: '#ff9900', description: 'Cloud Platform' },
  { id: '7', value: 39, label: 'MongoDB', color: '#47a248', description: 'Database' },
  { id: '8', value: 76, label: 'TypeScript', color: '#3178c6', description: 'Programming Language' },
];

const jobOpeningsData = [
  { id: '1', value: 1250, label: 'Frontend', color: '#3b82f6', category: 'Development' },
  { id: '2', value: 890, label: 'Backend', color: '#10b981', category: 'Development' },
  { id: '3', value: 650, label: 'Full Stack', color: '#f59e0b', category: 'Development' },
  { id: '4', value: 420, label: 'DevOps', color: '#ef4444', category: 'Operations' },
  { id: '5', value: 380, label: 'Data Science', color: '#8b5cf6', category: 'Analytics' },
  { id: '6', value: 290, label: 'Mobile', color: '#06b6d4', category: 'Development' },
  { id: '7', value: 180, label: 'QA', color: '#84cc16', category: 'Quality' },
  { id: '8', value: 150, label: 'UI/UX', color: '#ec4899', category: 'Design' },
];

export const CircularVisualizationDemo: React.FC = () => {
  const [activeVisualization, setActiveVisualization] = useState<'circular' | 'grid' | 'packed'>('circular');
  const [currentData, setCurrentData] = useState(sampleData);
  const [dataType, setDataType] = useState<'skills' | 'jobs'>('skills');
  const [maxValue, setMaxValue] = useState<number | undefined>(undefined);

  const handleDataTypeChange = (type: 'skills' | 'jobs') => {
    setDataType(type);
    setCurrentData(type === 'skills' ? sampleData : jobOpeningsData);
  };

  const generateRandomData = () => {
    const labels = ['React', 'Vue', 'Angular', 'Python', 'Java', 'Go', 'Rust', 'Swift'];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#ec4899'];
    
    const newData = labels.slice(0, 5 + Math.floor(Math.random() * 4)).map((label, index) => ({
      id: `${index}`,
      value: Math.floor(Math.random() * 100) + 10,
      label,
      color: colors[index % colors.length],
      description: `Technology ${index + 1}`
    }));
    
    setCurrentData(newData);
  };

  const adjustMaxValue = (increment: boolean) => {
    const currentMax = Math.max(...currentData.map(item => item.value));
    if (increment) {
      setMaxValue((maxValue || currentMax) + 20);
    } else {
      const newMax = (maxValue || currentMax) - 20;
      setMaxValue(newMax > 0 ? newMax : undefined);
    }
  };

  return (
    <Layout title="Circular Visualizations">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6">
            <Circle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Circular Number Visualizations
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Proportionally scaled circular visualizations that maintain relative relationships between values
          </p>
        </motion.div>

        {/* Controls */}
        <Card className="p-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeVisualization === 'circular' ? 'primary' : 'outline'}
                onClick={() => setActiveVisualization('circular')}
                className="flex items-center space-x-2"
              >
                <Circle className="w-4 h-4" />
                <span>Circular</span>
              </Button>
              <Button
                variant={activeVisualization === 'grid' ? 'primary' : 'outline'}
                onClick={() => setActiveVisualization('grid')}
                className="flex items-center space-x-2"
              >
                <Grid3X3 className="w-4 h-4" />
                <span>Grid</span>
              </Button>
              <Button
                variant={activeVisualization === 'packed' ? 'primary' : 'outline'}
                onClick={() => setActiveVisualization('packed')}
                className="flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Packed</span>
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={dataType === 'skills' ? 'secondary' : 'outline'}
                onClick={() => handleDataTypeChange('skills')}
                size="sm"
              >
                Skills Data
              </Button>
              <Button
                variant={dataType === 'jobs' ? 'secondary' : 'outline'}
                onClick={() => handleDataTypeChange('jobs')}
                size="sm"
              >
                Job Openings
              </Button>
              <Button
                onClick={generateRandomData}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Random Data</span>
              </Button>
            </div>
          </div>

          {/* Max Value Controls */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Display Value:
            </span>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => adjustMaxValue(false)}
                variant="outline"
                size="sm"
                disabled={!maxValue || maxValue <= 20}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                {maxValue || 'Auto'}
              </span>
              <Button
                onClick={() => adjustMaxValue(true)}
                variant="outline"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setMaxValue(undefined)}
                variant="ghost"
                size="sm"
              >
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8 flex items-center justify-center">
            {activeVisualization === 'circular' && (
              <CircularNumberVisualization
                data={currentData}
                size={350}
                maxDisplayValue={maxValue}
                showLabels={true}
                animationDelay={0.1}
              />
            )}
            {activeVisualization === 'grid' && (
              <CircularDataGrid
                data={currentData}
                size={400}
                maxDisplayValue={maxValue}
                showDescriptions={true}
              />
            )}
            {activeVisualization === 'packed' && (
              <CircularPackedBubbles
                data={currentData}
                size={380}
                maxDisplayValue={maxValue}
                showLabels={true}
                packingDensity={0.85}
              />
            )}
          </Card>

          {/* Data Table */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Data Values
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {currentData
                .sort((a, b) => b.value - a.value)
                .map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {item.value}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((item.value / Math.max(...currentData.map(d => d.value))) * 100)}%
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Circle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Proportional Scaling
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Numbers are scaled proportionally to fit within the circular boundaries while maintaining their relative relationships
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Grid3X3 className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Multiple Layouts
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Choose from circular arrangement, grid layout, or packed bubble visualization based on your data needs
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Interactive & Responsive
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Hover effects, tooltips, and smooth animations provide an engaging user experience across all devices
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};