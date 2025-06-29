import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Download, 
  Eye, 
  EyeOff,
  Zap,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import { Layout } from '../components/ui/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { FileUpload } from '../components/ui/FileUpload';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface ResumeAnalysisResult {
  atsScore: number;
  spellingErrors: string[];
  improvements: string[];
  formatIssues: string[];
  keywordDensity: { [key: string]: number };
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionAnalysis: {
    hasContactInfo: boolean;
    hasSummary: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
  };
  recommendations: string[];
}

export const ResumeAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [jobDescription, setJobDescription] = useState('');
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string>('');

  // Mock text extraction (in real implementation, this would call backend)
  const extractTextFromFile = async (file: File): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text based on file type
    if (file.type === 'application/pdf') {
      return `John Doe
Software Engineer
Email: john.doe@email.com | Phone: (555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of experience in full-stack development. 
Proficient in JavaScript, React, Node.js, and cloud technologies.

EXPERIENCE
Senior Software Engineer | Tech Corp | 2021 - Present
• Developed and maintained web applications using React and Node.js
• Collaborated with cross-functional teams to deliver high-quality software
• Implemented CI/CD pipelines reducing deployment time by 40%

Software Engineer | StartupXYZ | 2019 - 2021
• Built responsive web applications using modern JavaScript frameworks
• Worked with REST APIs and database optimization
• Mentored junior developers and conducted code reviews

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2015 - 2019

SKILLS
JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git`;
    } else {
      return `Jane Smith
Product Manager
jane.smith@email.com | (555) 987-6543

SUMMARY
Results-driven product manager with 4+ years of experience leading cross-functional teams 
and delivering successful digital products.

PROFESSIONAL EXPERIENCE
Senior Product Manager | Innovation Labs | 2022 - Present
• Led product strategy for mobile applications with 1M+ users
• Collaborated with engineering and design teams using Agile methodologies
• Increased user engagement by 35% through data-driven feature development

Product Manager | Digital Solutions | 2020 - 2022
• Managed product roadmap and prioritized features based on user feedback
• Conducted market research and competitive analysis
• Worked closely with stakeholders to define product requirements

EDUCATION
MBA in Business Administration | Business School | 2018 - 2020
BS in Marketing | State University | 2014 - 2018

CORE COMPETENCIES
Product Strategy, Agile, Scrum, Data Analysis, User Research, Stakeholder Management`;
    }
  };

  // Mock analysis function (in real implementation, this would call backend)
  const analyzeResume = async (resumeText: string, jobDesc: string): Promise<ResumeAnalysisResult> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock analysis based on content
    const isEngineerResume = resumeText.toLowerCase().includes('software engineer');
    const hasReact = resumeText.toLowerCase().includes('react');
    const hasAWS = resumeText.toLowerCase().includes('aws');
    const hasDocker = resumeText.toLowerCase().includes('docker');
    
    const baseScore = 65;
    let atsScore = baseScore;
    
    // Adjust score based on keyword matches
    if (hasReact) atsScore += 10;
    if (hasAWS) atsScore += 8;
    if (hasDocker) atsScore += 7;
    
    const matchedKeywords = [];
    const missingKeywords = [];
    
    if (hasReact) matchedKeywords.push('React');
    else missingKeywords.push('React');
    
    if (hasAWS) matchedKeywords.push('AWS');
    else missingKeywords.push('AWS');
    
    if (hasDocker) matchedKeywords.push('Docker');
    else missingKeywords.push('Docker');
    
    // Add more keywords based on job description
    if (jobDesc.toLowerCase().includes('typescript') && !resumeText.toLowerCase().includes('typescript')) {
      missingKeywords.push('TypeScript');
    }
    
    if (jobDesc.toLowerCase().includes('kubernetes') && !resumeText.toLowerCase().includes('kubernetes')) {
      missingKeywords.push('Kubernetes');
    }

    return {
      atsScore: Math.min(atsScore, 95),
      spellingErrors: ['experiance', 'sucessful', 'managment'].slice(0, Math.floor(Math.random() * 3)),
      improvements: [
        'Use more action verbs at the beginning of bullet points',
        'Quantify achievements with specific numbers and percentages',
        'Include more relevant keywords from the job description',
        'Improve formatting consistency across sections',
        'Add missing contact information',
        'Include a professional summary section',
        'Use consistent date formatting',
        'Add more technical skills relevant to the role'
      ].slice(0, 5 + Math.floor(Math.random() * 3)),
      formatIssues: [
        'Inconsistent bullet point formatting',
        'Multiple font sizes detected',
        'Uneven margins in experience section',
      ].slice(0, Math.floor(Math.random() * 3)),
      keywordDensity: {
        'JavaScript': 85,
        'React': hasReact ? 70 : 0,
        'Python': 45,
        'AWS': hasAWS ? 60 : 0,
        'Docker': hasDocker ? 40 : 0,
        'Node.js': 55,
        'SQL': 35,
        'Git': 25
      },
      matchedKeywords,
      missingKeywords,
      sectionAnalysis: {
        hasContactInfo: true,
        hasSummary: resumeText.toLowerCase().includes('summary'),
        hasExperience: resumeText.toLowerCase().includes('experience'),
        hasEducation: resumeText.toLowerCase().includes('education'),
        hasSkills: resumeText.toLowerCase().includes('skills')
      },
      recommendations: [
        'Add quantifiable achievements to your experience section',
        'Include more industry-specific keywords',
        'Optimize your professional summary for ATS scanning',
        'Use consistent formatting throughout the document',
        'Add relevant certifications if applicable'
      ]
    };
  };

  const handleFileSelect = async (file: File) => {
    setResumeFile(file);
    setUploadError('');
    setUploading(true);
    
    try {
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      
      // Save to database
      if (user) {
        const { error } = await supabase
          .from('resume_analyses')
          .insert({
            user_id: user.id,
            resume_url: `temp_${file.name}`, // In real implementation, upload to storage
            job_description: jobDescription || 'No job description provided',
            ats_score: 0, // Will be updated after analysis
            spelling_errors: [],
            improvement_suggestions: []
          });
        
        if (error) {
          console.error('Error saving resume analysis:', error);
        }
      }
    } catch (error: any) {
      console.error('Error extracting text:', error);
      setUploadError('Failed to extract text from resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileRemove = () => {
    setResumeFile(null);
    setExtractedText('');
    setResult(null);
    setUploadError('');
  };

  const handleAnalyze = async () => {
    if (!extractedText || !jobDescription.trim()) return;

    setAnalyzing(true);
    setAnalysisError('');
    
    try {
      const analysisResult = await analyzeResume(extractedText, jobDescription);
      setResult(analysisResult);
      
      // Update database with results
      if (user) {
        const { error } = await supabase
          .from('resume_analyses')
          .update({
            ats_score: analysisResult.atsScore,
            spelling_errors: analysisResult.spellingErrors,
            improvement_suggestions: analysisResult.improvements
          })
          .eq('user_id', user.id)
          .eq('resume_url', `temp_${resumeFile?.name}`);
        
        if (error) {
          console.error('Error updating analysis:', error);
        }
      }
    } catch (error: any) {
      console.error('Error analyzing resume:', error);
      setAnalysisError('Failed to analyze resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const clearAnalysis = () => {
    setResult(null);
    setResumeFile(null);
    setExtractedText('');
    setJobDescription('');
    setUploadError('');
    setAnalysisError('');
  };

  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <Layout title="Resume Analysis">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-6">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            AI-Powered Resume Analysis
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Upload your resume and get instant ATS scoring, keyword optimization, 
            and personalized improvement recommendations
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload & Input Section */}
          <div className="space-y-6">
            {/* Resume Upload */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Resume
                </h3>
              </div>
              
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileRemove={handleFileRemove}
                selectedFile={resumeFile}
                loading={uploading}
                error={uploadError}
                maxSize={5 * 1024 * 1024} // 5MB
              />

              {/* Extracted Text Preview */}
              {extractedText && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Extracted Text
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExtractedText(!showExtractedText)}
                    >
                      {showExtractedText ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {showExtractedText && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto"
                    >
                      <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {extractedText}
                      </pre>
                    </motion.div>
                  )}
                </div>
              )}
            </Card>

            {/* Job Description */}
            <Card className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-primary-600" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Job Description
                </h3>
              </div>
              <Textarea
                placeholder="Paste the job description you're applying for..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[200px] resize-none"
                helperText="Include the complete job posting for best analysis results"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleAnalyze}
                loading={analyzing}
                disabled={!extractedText || !jobDescription.trim() || uploading}
                className="flex-1"
                size="lg"
              >
                <TrendingUp className="w-5 h-5 mr-2" />
                Analyze Resume
              </Button>

              {result && (
                <Button
                  onClick={clearAnalysis}
                  variant="outline"
                  size="lg"
                >
                  <X className="w-5 h-5 mr-2" />
                  Clear
                </Button>
              )}
            </div>

            {analysisError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg flex items-center space-x-2"
              >
                <AlertCircle className="w-5 h-5 text-error-600 dark:text-error-400" />
                <p className="text-sm text-error-700 dark:text-error-400">{analysisError}</p>
              </motion.div>
            )}
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {analyzing ? (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-6"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Analyzing Resume
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Processing your resume against the job description...
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-gray-500">
                    <p>✓ Extracting keywords and skills</p>
                    <p>✓ Checking ATS compatibility</p>
                    <p>✓ Analyzing formatting and structure</p>
                    <p>✓ Generating improvement recommendations</p>
                  </div>
                </div>
              </Card>
            ) : result ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* ATS Score */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="w-6 h-6 text-primary-600" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        ATS Compatibility Score
                      </h3>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </Button>
                  </div>

                  <div className="flex items-center justify-center">
                    <CircularProgress
                      value={result.atsScore}
                      size={140}
                      color={getScoreColor(result.atsScore)}
                    />
                  </div>

                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.atsScore >= 80 
                        ? 'Excellent! Your resume is highly ATS-compatible'
                        : result.atsScore >= 60
                        ? 'Good score with room for improvement'
                        : 'Needs optimization for better ATS performance'
                      }
                    </p>
                  </div>
                </Card>

                {/* Keyword Analysis */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Target className="w-6 h-6 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Keyword Analysis
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matched Keywords */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-success-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Matched Keywords ({result.matchedKeywords.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.matchedKeywords.map((keyword, index) => (
                          <motion.span
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-3 py-1 bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Keywords */}
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertCircle className="w-5 h-5 text-warning-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Missing Keywords ({result.missingKeywords.length})
                        </h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((keyword, index) => (
                          <motion.span
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="px-3 py-1 bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200 rounded-full text-sm font-medium"
                          >
                            {keyword}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Keyword Density */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <BarChart3 className="w-6 h-6 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Keyword Density
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(result.keywordDensity).map(([keyword, density]) => (
                      <div key={keyword} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {keyword}
                          </span>
                          <span className="text-sm text-gray-500">
                            {density}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              density >= 70 ? 'bg-success-500' : 
                              density >= 40 ? 'bg-warning-500' : 'bg-error-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${density}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Spelling Errors */}
                {result.spellingErrors.length > 0 && (
                  <Card className="p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <AlertCircle className="w-6 h-6 text-error-600" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Spelling Errors ({result.spellingErrors.length})
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {result.spellingErrors.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-error-50 dark:bg-error-900/20 rounded-lg"
                        >
                          <span className="text-error-700 dark:text-error-400 font-mono">
                            {error}
                          </span>
                          <Button size="sm" variant="outline">
                            Suggest Fix
                          </Button>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <Lightbulb className="w-6 h-6 text-primary-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Improvement Recommendations
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {result.recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg"
                      >
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Ready to Analyze
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Upload your resume and add a job description to get started with AI-powered analysis
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span>ATS Compatibility Check</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span>Keyword Optimization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span>Spelling & Grammar Check</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                      <span>Improvement Suggestions</span>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Advanced algorithms analyze your resume against job requirements for optimal matching
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-success-600 dark:text-success-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ATS Optimization
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Ensure your resume passes through Applicant Tracking Systems with high scores
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-accent-100 dark:bg-accent-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-6 h-6 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Smart Recommendations
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Get personalized suggestions to improve your resume's impact and effectiveness
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};