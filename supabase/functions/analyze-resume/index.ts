import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AnalysisRequest {
  resumeText: string;
  jobDescription: string;
  userId: string;
}

interface AnalysisResult {
  atsScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  spellingErrors: string[];
  improvements: string[];
  keywordDensity: { [key: string]: number };
  sectionAnalysis: {
    hasContactInfo: boolean;
    hasSummary: boolean;
    hasExperience: boolean;
    hasEducation: boolean;
    hasSkills: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, jobDescription, userId }: AnalysisRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Basic text analysis
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract keywords from job description
    const jobKeywords = extractKeywords(jobDescription);
    const resumeKeywords = extractKeywords(resumeText);

    // Calculate keyword matches
    const matchedKeywords = jobKeywords.filter(keyword => 
      resumeLower.includes(keyword.toLowerCase())
    );
    const missingKeywords = jobKeywords.filter(keyword => 
      !resumeLower.includes(keyword.toLowerCase())
    );

    // Calculate ATS score based on keyword matching
    const keywordMatchRatio = matchedKeywords.length / Math.max(jobKeywords.length, 1);
    let atsScore = Math.round(keywordMatchRatio * 100);

    // Adjust score based on resume structure
    const sectionAnalysis = analyzeSections(resumeText);
    const sectionBonus = Object.values(sectionAnalysis).filter(Boolean).length * 5;
    atsScore = Math.min(atsScore + sectionBonus, 100);

    // Calculate keyword density
    const keywordDensity: { [key: string]: number } = {};
    jobKeywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = resumeText.match(regex) || [];
      keywordDensity[keyword] = Math.round((matches.length / resumeText.split(' ').length) * 1000) / 10;
    });

    // Generate spelling errors (simplified - in production use a proper spell checker)
    const spellingErrors = findSpellingErrors(resumeText);

    // Generate improvement suggestions
    const improvements = generateImprovements(atsScore, sectionAnalysis, missingKeywords);

    const result: AnalysisResult = {
      atsScore,
      matchedKeywords,
      missingKeywords,
      spellingErrors,
      improvements,
      keywordDensity,
      sectionAnalysis
    };

    // Save analysis to database
    const { error } = await supabaseClient
      .from('resume_analyses')
      .insert({
        user_id: userId,
        resume_url: 'uploaded_resume.pdf', // In production, store actual file URL
        job_description: jobDescription,
        ats_score: atsScore,
        spelling_errors: spellingErrors,
        improvement_suggestions: improvements
      });

    if (error) {
      console.error('Database error:', error);
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to analyze resume' }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

function extractKeywords(text: string): string[] {
  // Common technical and professional keywords
  const commonKeywords = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
    'Machine Learning', 'Data Analysis', 'Project Management',
    'Leadership', 'Communication', 'Problem Solving'
  ];

  // Extract keywords that appear in the text
  return commonKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  );
}

function analyzeSections(resumeText: string): {
  hasContactInfo: boolean;
  hasSummary: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
} {
  const text = resumeText.toLowerCase();
  
  return {
    hasContactInfo: /email|phone|@/.test(text),
    hasSummary: /summary|objective|profile/.test(text),
    hasExperience: /experience|work|employment|position/.test(text),
    hasEducation: /education|degree|university|college/.test(text),
    hasSkills: /skills|technologies|competencies/.test(text)
  };
}

function findSpellingErrors(text: string): string[] {
  // Simplified spelling error detection
  const commonErrors = [
    'experiance', 'sucessful', 'managment', 'recieve', 'seperate',
    'occured', 'definately', 'accomodate', 'neccessary', 'occassion'
  ];

  return commonErrors.filter(error => 
    text.toLowerCase().includes(error)
  );
}

function generateImprovements(
  atsScore: number, 
  sections: any, 
  missingKeywords: string[]
): string[] {
  const improvements: string[] = [];

  if (atsScore < 70) {
    improvements.push('Include more relevant keywords from the job description');
  }

  if (!sections.hasSummary) {
    improvements.push('Add a professional summary section at the top');
  }

  if (!sections.hasSkills) {
    improvements.push('Include a dedicated skills section');
  }

  if (missingKeywords.length > 0) {
    improvements.push(`Consider adding these relevant skills: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  improvements.push('Use action verbs to start bullet points');
  improvements.push('Quantify achievements with specific numbers and percentages');
  improvements.push('Ensure consistent formatting throughout the document');

  return improvements.slice(0, 6); // Limit to 6 suggestions
}