import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HeatmapRequest {
  userId: string;
  skills?: string[];
  locations?: string[];
  viewMode?: 'skills' | 'cities';
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, skills, locations, viewMode = 'skills' }: HeatmapRequest = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch user profile if skills/locations not provided
    let userSkills = skills
    let userLocations = locations

    if (!userSkills || !userLocations) {
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('skills, preferred_locations')
        .eq('id', userId)
        .single()

      if (profileError) {
        throw new Error('Failed to fetch user profile')
      }

      userSkills = userSkills || profile.skills || []
      userLocations = userLocations || profile.preferred_locations || []
    }

    // Mock heatmap data - in production, this would aggregate from job APIs
    const mockSkillData: SkillData[] = [
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
      // Add more skills based on user profile...
    ]

    const mockCityData: CityData[] = [
      { city: 'San Francisco', country: 'US', openings: 1640, avgSalary: 125000, companies: ['Google', 'Meta', 'Uber', 'Airbnb'] },
      { city: 'New York', country: 'US', openings: 1180, avgSalary: 108000, companies: ['Goldman Sachs', 'JPMorgan', 'Spotify', 'MongoDB'] },
      { city: 'Seattle', country: 'US', openings: 860, avgSalary: 118000, companies: ['Amazon', 'Microsoft', 'Zillow', 'Expedia'] },
      // Add more cities...
    ]

    // Filter data based on user skills and locations
    const filteredSkillData = mockSkillData.filter(skill =>
      userSkills.some((userSkill: string) => 
        userSkill.toLowerCase().includes(skill.skill.toLowerCase()) ||
        skill.skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    )

    const filteredCityData = mockCityData.filter(city =>
      userLocations.some((location: string) => 
        location.toLowerCase().includes(city.city.toLowerCase()) ||
        city.city.toLowerCase().includes(location.toLowerCase())
      )
    )

    const totalOpenings = filteredSkillData.reduce((sum, skill) => sum + skill.openings, 0)

    const heatmapData = {
      skillData: filteredSkillData,
      cityData: filteredCityData.length > 0 ? filteredCityData : mockCityData,
      totalOpenings,
      topSkills: filteredSkillData.map(s => s.skill).slice(0, 5),
      topCities: (filteredCityData.length > 0 ? filteredCityData : mockCityData).map(c => c.city).slice(0, 5),
      userSkills,
      userLocations
    }

    return new Response(
      JSON.stringify(heatmapData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Heatmap generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate heatmap data' }),
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