import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RoleSuggestionRequest {
  userId: string;
  country?: string;
  limit?: number;
}

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
  jobType: string;
  postedDate: string;
  description: string;
  applyUrl: string;
  experienceLevel: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, country = 'United States', limit = 20 }: RoleSuggestionRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    // Mock job data - in production, this would call Google Jobs API or similar
    const mockJobs: JobRole[] = [
      {
        id: '1',
        title: 'Senior Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        country: 'United States',
        matchScore: 0,
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'AWS', 'Git'],
        matchedSkills: [],
        missingSkills: [],
        salaryRange: '$120k - $160k',
        jobType: 'Full-time',
        postedDate: new Date().toISOString(),
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
        matchScore: 0,
        requiredSkills: ['JavaScript', 'React', 'Python', 'SQL', 'Docker'],
        matchedSkills: [],
        missingSkills: [],
        salaryRange: '$90k - $130k',
        jobType: 'Remote',
        postedDate: new Date().toISOString(),
        description: 'Join our fast-growing startup as a Full Stack Engineer...',
        applyUrl: 'https://example.com/apply/2',
        experienceLevel: 'Mid'
      },
      // Add more mock jobs...
    ]

    // Calculate match scores based on user skills
    const userSkills = profile.skills || []
    const suggestedRoles = mockJobs.map(job => {
      const matchedSkills = job.requiredSkills.filter(skill => 
        userSkills.some((userSkill: string) => 
          userSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(userSkill.toLowerCase())
        )
      )
      
      const matchScore = Math.round((matchedSkills.length / job.requiredSkills.length) * 100)
      
      return {
        ...job,
        matchedSkills,
        missingSkills: job.requiredSkills.filter(skill => !matchedSkills.includes(skill)),
        matchScore
      }
    })
    .filter(job => job.country === country)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)

    // Save job analysis to database
    const { error: insertError } = await supabaseClient
      .from('job_analyses')
      .insert(
        suggestedRoles.map(role => ({
          user_id: userId,
          job_description: role.description,
          ats_score: role.matchScore,
          matched_skills: role.matchedSkills,
          missing_skills: role.missingSkills
        }))
      )

    if (insertError) {
      console.error('Failed to save job analyses:', insertError)
    }

    return new Response(
      JSON.stringify({ 
        roles: suggestedRoles,
        totalFound: suggestedRoles.length,
        country,
        userSkills
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Role suggestion error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch role suggestions' }),
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