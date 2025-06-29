import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  MapPin, 
  Building2, 
  ExternalLink, 
  Filter,
  Search,
  Star,
  Clock,
  Users,
  Briefcase,
  Target,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Calendar
} from 'lucide-react';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../hooks/useProfile';

interface JobRole {
  id: string;
  title: string;
  company: string;
  location: string;
  country: string;
  matchScore: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  salaryRange: string;
  jobType: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  postedDate: string;
  description: string;
  applyUrl: string;
  companyLogo?: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead';
}

interface FilterOptions {
  country: string;
  jobType: string;
  experienceLevel: string;
  minMatchScore: number;
}

const mockJobRoles: JobRole[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    country: 'United States',
    matchScore: 92,
    requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Git'],
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'Git'],
    missingSkills: ['AWS'],
    salaryRange: '$120k - $160k',
    jobType: 'Full-time',
    postedDate: '2024-01-15',
    description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
    applyUrl: 'https://example.com/apply/1',
    experienceLevel: 'Senior'
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'StartupXYZ',
    location: 'Remote',
    country: 'United States',
    matchScore: 88,
    requiredSkills: ['JavaScript', 'React', 'Python', 'SQL', 'Docker'],
    matchedSkills: ['JavaScript', 'React', 'Python', 'SQL'],
    missingSkills: ['Docker'],
    salaryRange: '$90k - $130k',
    jobType: 'Remote',
    postedDate: '2024-01-12',
    description: 'Join our fast-growing startup as a Full Stack Engineer...',
    applyUrl: 'https://example.com/apply/2',
    experienceLevel: 'Mid'
  },
  {
    id: '3',
    title: 'React Developer',
    company: 'Digital Agency',
    location: 'New York, NY',
    country: 'United States',
    matchScore: 85,
    requiredSkills: ['React', 'JavaScript', 'CSS', 'Git', 'Figma'],
    matchedSkills: ['React', 'JavaScript', 'Git'],
    missingSkills: ['CSS', 'Figma'],
    salaryRange: '$80k - $110k',
    jobType: 'Full-time',
    postedDate: '2024-01-10',
    description: 'We need a talented React Developer to build amazing user interfaces...',
    applyUrl: 'https://example.com/apply/3',
    experienceLevel: 'Mid'
  },
  {
    id: '4',
    title: 'Software Engineer',
    company: 'Enterprise Solutions',
    location: 'Austin, TX',
    country: 'United States',
    matchScore: 78,
    requiredSkills: ['Java', 'Spring Boot', 'SQL', 'Microservices', 'Kubernetes'],
    matchedSkills: ['Java', 'SQL'],
    missingSkills: ['Spring Boot', 'Microservices', 'Kubernetes'],
    salaryRange: '$95k - $125k',
    jobType: 'Full-time',
    postedDate: '2024-01-08',
    description: 'Looking for a Software Engineer to work on enterprise applications...',
    applyUrl: 'https://example.com/apply/4',
    experienceLevel: 'Mid'
  },
  {
    id: '5',
    title: 'Frontend Developer',
    company: 'Creative Studio',
    location: 'Los Angeles, CA',
    country: 'United States',
    matchScore: 82,
    requiredSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    matchedSkills: ['React', 'TypeScript'],
    missingSkills: ['Tailwind CSS', 'Next.js'],
    salaryRange: '$75k - $100k',
    jobType: 'Full-time',
    postedDate: '2024-01-14',
    description: 'Join our creative team to build beautiful web experiences...',
    applyUrl: 'https://example.com/apply/5',
    experienceLevel: 'Entry'
  }
];

const countries = [
  'All Countries',
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'Australia',
  'Netherlands',
  'Sweden'
];

const jobTypes = ['All Types', 'Full-time', 'Part-time', 'Contract', 'Remote'];
const experienceLevels = ['All Levels', 'Entry', 'Mid', 'Senior', 'Lead'];

export const RoleSuggestionsPage: React.FC = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<JobRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    country: 'All Countries',
    jobType: 'All Types',
    experienceLevel: 'All Levels',
    minMatchScore: 0
  });

  // Simulate API call to fetch job suggestions
  useEffect(() => {
    const fetchJobSuggestions = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter mock data based on user's skills
      const userSkills = profile?.skills || [];
      const suggestedRoles = mockJobRoles.map(role => {
        const matchedSkills = role.requiredSkills.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        
        const matchScore = Math.round((matchedSkills.length / role.requiredSkills.length) * 100);
        
        return {
          ...role,
          matchedSkills,
          missingSkills: role.requiredSkills.filter(skill => !matchedSkills.includes(skill)),
          matchScore: Math.max(matchScore, role.matchScore - 20) // Ensure some variation
        };
      }).sort((a, b) => b.matchScore - a.matchScore);

      setJobRoles(suggestedRoles);
      setFilteredRoles(suggestedRoles);
      setLoading(false);
    };

    if (profile) {
      fetchJobSuggestions();
    }
  }, [profile]);

  // Apply filters
  useEffect(() => {
    let filtered = jobRoles.filter(role => {
      const matchesSearch = role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           role.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCountry = filters.country === 'All Countries' || role.country === filters.country;
      const matchesJobType = filters.jobType === 'All Types' || role.jobType === filters.jobType;
      const matchesExperience = filters.experienceLevel === 'All Levels' || role.experienceLevel === filters.experienceLevel;
      const matchesScore = role.matchScore >= filters.minMatchScore;

      return matchesSearch && matchesCountry && matchesJobType && matchesExperience && matchesScore;
    });

    setFilteredRoles(filtered);
  }, [searchTerm, filters, jobRoles]);

  const getMatchScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const refreshSuggestions = () => {
    setLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <Layout title="Role Suggestions">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-6 animate-pulse" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-96 mx-auto mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto animate-pulse" />
          </div>

          {/* Filters Skeleton */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1 animate-pulse" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse" />
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="p-6">
                <div className="space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                  </div>
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Role Suggestions">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Suggested Roles Based on Your Profile
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover job opportunities that match your skills, experience, and career goals
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <Button
              variant="outline"
              onClick={refreshSuggestions}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <select
                      value={filters.country}
                      onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Type
                    </label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters({ ...filters, jobType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {jobTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Experience Level
                    </label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters({ ...filters, experienceLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Min Match Score: {filters.minMatchScore}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="10"
                      value={filters.minMatchScore}
                      onChange={(e) => setFilters({ ...filters, minMatchScore: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Found {filteredRoles.length} role{filteredRoles.length !== 1 ? 's' : ''} matching your profile
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success-500 rounded-full" />
              <span>80%+ match</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-warning-500 rounded-full" />
              <span>60-79% match</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-error-500 rounded-full" />
              <span>&lt;60% match</span>
            </div>
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredRoles.map((role, index) => (
              <motion.div
                key={role.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {role.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 mb-2">
                          <Building2 className="w-4 h-4" />
                          <span>{role.company}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{role.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(role.postedDate)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <CircularProgress
                          value={role.matchScore}
                          size={60}
                          color={getMatchScoreColor(role.matchScore)}
                          showValue={true}
                        />
                        <span className="text-xs text-gray-500">Match</span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{role.jobType}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Star className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{role.experienceLevel}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{role.salaryRange}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{role.country}</span>
                      </div>
                    </div>

                    {/* Skills Analysis */}
                    <div className="space-y-3">
                      {/* Matched Skills */}
                      {role.matchedSkills.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-success-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Matched Skills ({role.matchedSkills.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.matchedSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Skills */}
                      {role.missingSkills.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-warning-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Skills to Learn ({role.missingSkills.length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {role.missingSkills.map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 rounded-full text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {role.description}
                    </p>

                    {/* Actions */}
                    <div className="flex space-x-3 pt-2">
                      <Button
                        onClick={() => window.open(role.applyUrl, '_blank')}
                        className="flex-1 flex items-center justify-center space-x-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Apply Now</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex items-center space-x-2"
                      >
                        <Target className="w-4 h-4" />
                        <span>Save</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredRoles.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No roles found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your filters or search terms to find more opportunities
            </p>
            <Button onClick={() => {
              setSearchTerm('');
              setFilters({
                country: 'All Countries',
                jobType: 'All Types',
                experienceLevel: 'All Levels',
                minMatchScore: 0
              });
            }}>
              Clear Filters
            </Button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filteredRoles.filter(r => r.matchScore >= 80).length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">High Match Roles</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filteredRoles.filter(r => r.jobType === 'Remote').length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Remote Opportunities</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {filteredRoles.filter(r => {
                const daysDiff = Math.ceil((new Date().getTime() - new Date(r.postedDate).getTime()) / (1000 * 60 * 60 * 24));
                return daysDiff <= 7;
              }).length}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Posted This Week</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};