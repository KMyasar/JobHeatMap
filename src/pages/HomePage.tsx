import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, TrendingUp, Zap, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';

interface AnalysisResult {
  atsScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
}

export const HomePage: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyzeJobDescription = async () => {
    if (!jobDescription.trim()) return;

    setAnalyzing(true);
    
    // Simulate API call with mock analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock analysis results
    const mockResult: AnalysisResult = {
      atsScore: Math.floor(Math.random() * 30) + 70, // 70-100
      matchedSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git'],
      missingSkills: ['TypeScript', 'AWS', 'Docker', 'Kubernetes'],
      recommendations: [
        'Add more action verbs to your experience descriptions',
        'Include specific metrics and achievements',
        'Tailor your skills section to match job requirements',
        'Consider adding certifications in missing skill areas'
      ]
    };

    setResult(mockResult);
    setAnalyzing(false);
  };

  const clearAnalysis = () => {
    setResult(null);
    setJobDescription('');
  };

  return (
    <Layout title="Job Description Analysis">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Analyze Your Job Fit
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Paste any job description to get instant ATS scoring, skill matching, and personalized recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Job Description
                </h3>
              </div>

              <Textarea
                placeholder="Paste the job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[300px] resize-none"
                helperText="Copy and paste the complete job posting for best results"
              />

              <div className="flex space-x-4">
                <Button
                  onClick={analyzeJobDescription}
                  loading={analyzing}
                  disabled={!jobDescription.trim()}
                  className="flex-1"
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analyze Job Fit
                </Button>
                
                {result && (
                  <Button
                    onClick={clearAnalysis}
                    variant="outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <Card className="p-6">
            {analyzing ? (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Analyzing Job Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  Processing requirements and matching against your profile...
                </p>
              </div>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-success-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Analysis Results
                  </h3>
                </div>

                {/* ATS Score */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      ATS Compatibility Score
                    </span>
                    <span className={`text-2xl font-bold ${
                      result.atsScore >= 80 ? 'text-success-600' : 
                      result.atsScore >= 60 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {result.atsScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${
                        result.atsScore >= 80 ? 'bg-success-500' : 
                        result.atsScore >= 60 ? 'bg-warning-500' : 'bg-error-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${result.atsScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Matched Skills */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Matched Skills ({result.matchedSkills.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-warning-600" />
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Skills to Develop ({result.missingSkills.length})
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, index) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-3 py-1 bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Recommendations
                  </h4>
                  <div className="space-y-2">
                    {result.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Ready to Analyze
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter a job description to see your compatibility score and get personalized recommendations
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">98%</h3>
            <p className="text-gray-600 dark:text-gray-400">Analysis Accuracy</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">2.5x</h3>
            <p className="text-gray-600 dark:text-gray-400">Better Interview Rate</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">50K+</h3>
            <p className="text-gray-600 dark:text-gray-400">Jobs Analyzed</p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};