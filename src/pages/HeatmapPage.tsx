import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Map, 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  Filter,
  RefreshCw,
  Globe,
  Building2,
  Users,
  Briefcase,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

interface SkillData {
  skill: string;
  openings: number;
  avgSalary: number;
  growth: number;
  cities: CityData[];
  sampleJobs: string[];
}

interface CityData {
  city: string;
  country: string;
  openings: number;
  avgSalary: number;
  companies: string[];
}

interface HeatmapData {
  skillData: SkillData[];
  cityData: CityData[];
  totalOpenings: number;
  topSkills: string[];
  topCities: string[];
}

const mockHeatmapData: HeatmapData = {
  skillData: [
    {
      skill: 'React',
      openings: 1250,
      avgSalary: 95000,
      growth: 15.2,
      cities: [
        { city: 'San Francisco', country: 'US', openings: 320, avgSalary: 125000, companies: ['Meta', 'Google', 'Airbnb'] },
        { city: 'New York', country: 'US', openings: 280, avgSalary: 110000, companies: ['Goldman Sachs', 'JPMorgan', 'Spotify'] },
        { city: 'Seattle', country: 'US', openings: 220, avgSalary: 115000, companies: ['Amazon', 'Microsoft', 'Expedia'] }
      ],
      sampleJobs: ['Frontend Developer', 'Full Stack Engineer', 'React Developer', 'UI Engineer']
    },
    {
      skill: 'Python',
      openings: 1180,
      avgSalary: 105000,
      growth: 22.8,
      cities: [
        { city: 'San Francisco', country: 'US', openings: 350, avgSalary: 135000, companies: ['Google', 'Uber', 'Dropbox'] },
        { city: 'Austin', country: 'US', openings: 190, avgSalary: 95000, companies: ['Tesla', 'Indeed', 'Dell'] },
        { city: 'Boston', country: 'US', openings: 160, avgSalary: 105000, companies: ['HubSpot', 'Wayfair', 'Akamai'] }
      ],
      sampleJobs: ['Data Scientist', 'Backend Developer', 'ML Engineer', 'DevOps Engineer']
    },
    {
      skill: 'JavaScript',
      openings: 1420,
      avgSalary: 88000,
      growth: 12.5,
      cities: [
        { city: 'San Francisco', country: 'US', openings: 380, avgSalary: 115000, companies: ['Stripe', 'Square', 'Twitter'] },
        { city: 'Los Angeles', country: 'US', openings: 240, avgSalary: 85000, companies: ['Netflix', 'Snapchat', 'SpaceX'] },
        { city: 'Chicago', country: 'US', openings: 180, avgSalary: 78000, companies: ['Groupon', 'Grubhub', 'Motorola'] }
      ],
      sampleJobs: ['Frontend Developer', 'Full Stack Developer', 'Node.js Developer', 'Web Developer']
    },
    {
      skill: 'AWS',
      openings: 980,
      avgSalary: 115000,
      growth: 28.3,
      cities: [
        { city: 'Seattle', country: 'US', openings: 290, avgSalary: 130000, companies: ['Amazon', 'Microsoft', 'F5'] },
        { city: 'Virginia', country: 'US', openings: 220, avgSalary: 120000, companies: ['Capital One', 'Booz Allen', 'Accenture'] },
        { city: 'Denver', country: 'US', openings: 140, avgSalary: 100000, companies: ['Palantir', 'SendGrid', 'Ping Identity'] }
      ],
      sampleJobs: ['Cloud Engineer', 'DevOps Engineer', 'Solutions Architect', 'SRE']
    },
    {
      skill: 'Node.js',
      openings: 850,
      avgSalary: 92000,
      growth: 18.7,
      cities: [
        { city: 'San Francisco', country: 'US', openings: 210, avgSalary: 115000, companies: ['Uber', 'Airbnb', 'LinkedIn'] },
        { city: 'New York', country: 'US', openings: 180, avgSalary: 105000, companies: ['MongoDB', 'Datadog', 'Peloton'] },
        { city: 'Austin', country: 'US', openings: 120, avgSalary: 85000, companies: ['Indeed', 'Bumble', 'RetailMeNot'] }
      ],
      sampleJobs: ['Backend Developer', 'Full Stack Developer', 'API Developer', 'Microservices Engineer']
    },
    {
      skill: 'TypeScript',
      openings: 720,
      avgSalary: 98000,
      growth: 35.2,
      cities: [
        { city: 'San Francisco', country: 'US', openings: 190, avgSalary: 120000, companies: ['Slack', 'Asana', 'Figma'] },
        { city: 'Seattle', country: 'US', openings: 150, avgSalary: 110000, companies: ['Microsoft', 'Zillow', 'Redfin'] },
        { city: 'New York', country: 'US', openings: 130, avgSalary: 108000, companies: ['Palantir', 'Two Sigma', 'Oscar Health'] }
      ],
      sampleJobs: ['Frontend Developer', 'Full Stack Developer', 'Software Engineer', 'React Developer']
    }
  ],
  cityData: [
    { city: 'San Francisco', country: 'US', openings: 1640, avgSalary: 125000, companies: ['Google', 'Meta', 'Uber', 'Airbnb'] },
    { city: 'New York', country: 'US', openings: 1180, avgSalary: 108000, companies: ['Goldman Sachs', 'JPMorgan', 'Spotify', 'MongoDB'] },
    { city: 'Seattle', country: 'US', openings: 860, avgSalary: 118000, companies: ['Amazon', 'Microsoft', 'Zillow', 'Expedia'] },
    { city: 'Austin', country: 'US', openings: 650, avgSalary: 92000, companies: ['Tesla', 'Indeed', 'Bumble', 'Dell'] },
    { city: 'Los Angeles', country: 'US', openings: 580, avgSalary: 95000, companies: ['Netflix', 'Snapchat', 'SpaceX', 'Riot Games'] },
    { city: 'Boston', country: 'US', openings: 520, avgSalary: 105000, companies: ['HubSpot', 'Wayfair', 'Akamai', 'DraftKings'] }
  ],
  totalOpenings: 6430,
  topSkills: ['JavaScript', 'React', 'Python', 'AWS', 'Node.js'],
  topCities: ['San Francisco', 'New York', 'Seattle', 'Austin', 'Los Angeles']
};

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const HeatmapPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'skills' | 'cities'>('skills');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [showSalaryData, setShowSalaryData] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Simulate API call to fetch heatmap data
  useEffect(() => {
    const fetchHeatmapData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter data based on user's skills and preferred locations
      const userSkills = profile?.skills || [];
      const userLocations = profile?.preferred_locations || [];
      
      let filteredData = { ...mockHeatmapData };
      
      if (userSkills.length > 0) {
        filteredData.skillData = filteredData.skillData.filter(skill =>
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.skill.toLowerCase()) ||
            skill.skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
      }
      
      setHeatmapData(filteredData);
      setLoading(false);
    };

    if (profile) {
      fetchHeatmapData();
    }
  }, [profile]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  const formatSalary = (salary: number) => {
    return `$${(salary / 1000).toFixed(0)}k`;
  };

  const getChartData = () => {
    if (!heatmapData) return [];
    
    if (viewMode === 'skills') {
      return heatmapData.skillData.map(skill => ({
        name: skill.skill,
        openings: skill.openings,
        salary: skill.avgSalary,
        growth: skill.growth
      }));
    } else {
      return heatmapData.cityData.map(city => ({
        name: city.city,
        openings: city.openings,
        salary: city.avgSalary,
        growth: 0 // Cities don't have growth data in this mock
      }));
    }
  };

  const renderChart = () => {
    const data = getChartData();
    
    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-gray-600 dark:text-gray-400" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => {
                if (name === 'salary') return [formatSalary(value as number), 'Avg Salary'];
                if (name === 'growth') return [`${value}%`, 'Growth'];
                return [value, 'Job Openings'];
              }}
            />
            <Bar dataKey="openings" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            {showSalaryData && (
              <Bar dataKey="salary" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="openings"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Job Openings']}
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    }
    
    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-gray-600 dark:text-gray-400"
              tick={{ fontSize: 12 }}
            />
            <YAxis className="text-gray-600 dark:text-gray-400" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value) => [value, 'Job Openings']}
            />
            <Area 
              type="monotone" 
              dataKey="openings" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  if (loading) {
    return (
      <Layout title="Openings Heatmap">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-6 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto animate-pulse" />
          </div>

          {/* Controls Skeleton */}
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>

          {/* Chart Skeleton */}
          <Card className="p-6">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </Card>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mx-auto" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-auto" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mx-auto" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Openings Heatmap">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6">
            <Map className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Job Openings Heatmap
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Visualize job market demand for your skills across different locations and technologies
          </p>
        </motion.div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={viewMode === 'skills' ? 'primary' : 'outline'}
              onClick={() => setViewMode('skills')}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>By Skills</span>
            </Button>
            <Button
              variant={viewMode === 'cities' ? 'primary' : 'outline'}
              onClick={() => setViewMode('cities')}
              className="flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>By Cities</span>
            </Button>
            <Button
              variant={showSalaryData ? 'secondary' : 'outline'}
              onClick={() => setShowSalaryData(!showSalaryData)}
              className="flex items-center space-x-2"
            >
              {showSalaryData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>Salary Data</span>
            </Button>
          </div>
          
          <div className="flex gap-2">
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="line">Area Chart</option>
            </select>
            <Button
              variant="outline"
              onClick={refreshData}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Main Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Job Openings {viewMode === 'skills' ? 'by Skill' : 'by City'}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-primary-500 rounded-full" />
                <span>Job Openings</span>
              </div>
              {showSalaryData && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                  <span>Avg Salary</span>
                </div>
              )}
            </div>
          </div>
          {renderChart()}
        </Card>

        {/* Detailed Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills/Cities List */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {viewMode === 'skills' ? 'Skills' : 'Cities'} Breakdown
            </h3>
            <div className="space-y-4">
              {(viewMode === 'skills' ? heatmapData?.skillData : heatmapData?.cityData)?.map((item, index) => (
                <motion.div
                  key={viewMode === 'skills' ? (item as SkillData).skill : (item as CityData).city}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => setSelectedSkill(viewMode === 'skills' ? (item as SkillData).skill : (item as CityData).city)}
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {viewMode === 'skills' ? (item as SkillData).skill : (item as CityData).city}
                    </h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>{item.openings} openings</span>
                      <span>{formatSalary(item.avgSalary)} avg</span>
                      {viewMode === 'skills' && (
                        <span className="text-success-600">+{(item as SkillData).growth}% growth</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">
                      {item.openings}
                    </div>
                    <div className="text-sm text-gray-500">jobs</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Sample Jobs */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Sample Job Titles
            </h3>
            <div className="space-y-4">
              {heatmapData?.skillData.map((skill, index) => (
                <div key={skill.skill} className="space-y-2">
                  <h4 className="font-medium text-gray-900 dark:text-white flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span>{skill.skill}</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skill.sampleJobs.map((job) => (
                      <span
                        key={job}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {job}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {heatmapData?.totalOpenings.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Openings</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {heatmapData?.skillData.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Skills Tracked</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {heatmapData?.cityData.length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Cities Covered</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-warning-600 dark:text-warning-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {formatSalary(heatmapData?.skillData.reduce((acc, skill) => acc + skill.avgSalary, 0) / (heatmapData?.skillData.length || 1))}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Avg Salary</p>
          </Card>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Fastest Growing Skills
            </h3>
            <div className="space-y-3">
              {heatmapData?.skillData
                .sort((a, b) => b.growth - a.growth)
                .slice(0, 5)
                .map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                        <span className="text-success-600 dark:text-success-400 text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {skill.skill}
                      </span>
                    </div>
                    <span className="text-success-600 font-semibold">
                      +{skill.growth}%
                    </span>
                  </div>
                ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Highest Paying Cities
            </h3>
            <div className="space-y-3">
              {heatmapData?.cityData
                .sort((a, b) => b.avgSalary - a.avgSalary)
                .slice(0, 5)
                .map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {city.city}
                      </span>
                    </div>
                    <span className="text-primary-600 font-semibold">
                      {formatSalary(city.avgSalary)}
                    </span>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};