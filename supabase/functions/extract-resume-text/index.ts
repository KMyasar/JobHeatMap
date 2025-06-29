import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 5MB.' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Check file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only PDF and DOCX files are supported.' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    let extractedText = ''

    if (file.type === 'application/pdf') {
      // For PDF files - in production, use a proper PDF parsing library
      extractedText = await extractPDFText(file)
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // For DOCX files - in production, use a proper DOCX parsing library
      extractedText = await extractDOCXText(file)
    }

    return new Response(
      JSON.stringify({ 
        text: extractedText,
        filename: file.name,
        size: file.size,
        type: file.type
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Text extraction error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to extract text from file' }),
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

async function extractPDFText(file: File): Promise<string> {
  // Mock PDF text extraction
  // In production, use libraries like pdf-parse or pdfjs-dist
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
JavaScript, React, Node.js, Python, SQL, AWS, Docker, Git`
}

async function extractDOCXText(file: File): Promise<string> {
  // Mock DOCX text extraction
  // In production, use libraries like mammoth or docx-parser
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
Product Strategy, Agile, Scrum, Data Analysis, User Research, Stakeholder Management`
}