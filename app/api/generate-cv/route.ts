import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CV_GENERATION_PROMPT = `You are an expert CV/resume writer who specializes in creating ATS-optimized resumes. You create CVs that are tailored to specific job descriptions, using keywords from the posting naturally throughout the document.

USER PROMPT:
"Create a professional, ATS-optimized CV for this candidate applying to this specific job.

TARGET JOB:
- Title: {job_title}
- Company: {company_name}
- Key Requirements: {requirements}
- Key Skills Needed: {skills_needed}
- Responsibilities: {responsibilities}

CANDIDATE INFORMATION:
- Name: {name}
- Current Title: {currentTitle}
- Years of Experience: {yearsExperience}
- Skills: {skills}
- Work Experience: {experience}
- Education: {education}
- Certifications: {certifications}
- Languages: {languages}

INSTRUCTIONS:
1. Tailor everything to the TARGET JOB
2. Use keywords from the job description naturally
3. Quantify achievements (use realistic numbers)
4. If candidate didn't provide enough details, create realistic placeholder content marked with [EDIT THIS]
5. Professional summary must reference the target role
6. Keep to maximum 2 pages of content
7. Use strong action verbs (Led, Built, Optimized, Delivered...)
8. Order sections by relevance to target job

Return ONLY valid JSON in this exact format:
{
  "cv": {
    "summary": "3-4 sentence professional summary",
    "skills": ["skill1", "skill2", "skill3"],
    "experience": [
      {
        "title": "Job Title",
        "company": "Company Name",
        "period": "Jan 2022 - Present",
        "bullets": [
          "Achievement bullet 1 with numbers",
          "Achievement bullet 2 with numbers",
          "Achievement bullet 3"
        ]
      }
    ],
    "education": [
      {
        "degree": "Degree Name",
        "institution": "University Name",
        "year": "2020"
      }
    ],
    "certifications": ["Cert 1", "Cert 2"],
    "languages": ["English (Native)", "Spanish (Fluent)"],
    "ats_keywords": {
      "matched": ["keyword1", "keyword2"],
      "missing": ["keyword3", "keyword4"],
      "score": 85
    },
    "tips": [
      "Tip 1 to improve this CV",
      "Tip 2 to improve this CV"
    ]
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId, userInfo } = body;

    if (!analysisId || !userInfo) {
      return NextResponse.json(
        { error: 'Missing analysisId or userInfo' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Fetch analysis data
    const { data: analysis, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // 2. Prepare prompt
    // Extract relevant info from analysis (assuming these fields might be embedded in the job description or extracted separately)
    // Since we store the raw job description, we'll pass that along with the structured analysis data

    // Extract Requirements/Skills from Red/Green flags or just pass specific fields if available
    // For better results, we might want to parse the job description again or use the existing extracted flags

    const requirements = analysis.job_quality?.realism < 50 ? "High realism requirements" : "Standard requirements";
    const skills_needed = "Extracted from job description"; // In a real scenario, we'd parse this better

    const prompt = CV_GENERATION_PROMPT
      .replace('{job_title}', analysis.job_title)
      .replace('{company_name}', analysis.company_name)
      .replace('{requirements}', requirements) // Simplification for now
      .replace('{skills_needed}', skills_needed) // Simplification for now
      .replace('{responsibilities}', "As described in job description")
      .replace('{name}', userInfo.fullName)
      .replace('{currentTitle}', userInfo.currentTitle)
      .replace('{yearsExperience}', userInfo.yearsExperience.toString())
      .replace('{skills}', userInfo.skills || 'Not provided')
      .replace('{experience}', userInfo.experience || 'Not provided')
      .replace('{education}', userInfo.education || 'Not provided')
      .replace('{certifications}', userInfo.certifications || 'Not provided')
      .replace('{languages}', userInfo.languages || 'Not provided');

    // Append job description for context
    const fullPrompt = `${prompt}\n\nJOB DESCRIPTION:\n${analysis.job_description.substring(0, 2000)}`;

    console.log('[API] Generating CV...');

    // 3. Call OpenAI
    let aiResponse = await getLLMResponse(
      createConversation(fullPrompt, "Generate the JSON."),
      { temperature: 0.7, maxTokens: 2500 }
    );

    // 4. Parse Response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

    let cvData;
    try {
      cvData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('[API] JSON Parse Error:', e);
      console.error('[API] Raw Response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to generate valid JSON for CV' },
        { status: 500 }
      );
    }

    return NextResponse.json(cvData);

  } catch (error) {
    console.error('[API] CV Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
