import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTERVIEW_PREP_PROMPT = `You are an expert interview coach who prepares candidates with tailored questions and winning answers based on specific job postings.

USER PROMPT:
"Generate interview preparation material for this candidate applying to this specific job.

TARGET JOB:
- Title: {job_title}
- Company: {company_name}
- Requirements: {requirements}
- Responsibilities: {responsibilities}
- Key Skills: {skills}

CANDIDATE:
- Name: {name}
- Current Title: {currentTitle}
- Years of Experience: {yearsExperience}
- Skills: {user_skills}
- Experience: {experience}

DIFFICULTY: {difficulty}
- beginner: Focus on common interview questions, basic technical concepts, and simple behavioral questions. Answers should be straightforward and confidence-building.
- intermediate: Mix of behavioral (STAR method), technical deep-dives, and situational questions. Answers should show depth and specific examples.
- advanced: Complex system design, leadership scenarios, cross-functional challenges, and trick questions. Answers should demonstrate strategic thinking.

Generate EXACTLY this structure:

1. OPENING QUESTIONS (2 questions)
   - The classic openers like 'Tell me about yourself'
   - But with TAILORED answers for THIS specific role

2. TECHNICAL QUESTIONS (4 questions)
   - Based on the SPECIFIC tech stack and requirements
   - Questions a hiring manager for THIS role would ask

3. BEHAVIORAL QUESTIONS (3 questions)  
   - STAR method format (Situation, Task, Action, Result)
   - Related to the job responsibilities

4. SITUATIONAL QUESTIONS (2 questions)
   - 'What would you do if...' scenarios
   - Specific to the role and industry

5. QUESTIONS TO ASK THE INTERVIEWER (3 questions)
   - Smart questions that show research about the company
   - Questions that subtly highlight the candidate's strengths

6. RED FLAGS TO WATCH (3 items)
   - Warning signs during the interview that suggest problems with the role/company

7. SALARY NEGOTIATION TIP (1 tip)
   - Specific to this role level and market

Return ONLY valid JSON:
{
  "interview_prep": {
    "job_title": "string",
    "company": "string",
    "difficulty": "string",
    "estimated_prep_time": "string (e.g. '2-3 hours')",
    "sections": [
      {
        "title": "Opening Questions",
        "icon": "👋",
        "questions": [
          {
            "question": "string",
            "why_they_ask": "string (brief explanation)",
            "sample_answer": "string (tailored answer)",
            "pro_tip": "string (quick tip)",
            "difficulty": "easy" | "medium" | "hard"
          }
        ]
      },
      {
        "title": "Technical Questions",
        "icon": "⚙️",
        "questions": []
      },
      {
        "title": "Behavioral Questions",
        "icon": "🧠",
        "questions": [
          {
            "question": "string",
            "why_they_ask": "string",
            "sample_answer": "string (in STAR format - clearly label Situation, Task, Action, Result)",
            "pro_tip": "string",
            "difficulty": "easy" | "medium" | "hard"
          }
        ]
      },
      {
        "title": "Situational Questions",
        "icon": "🎯",
        "questions": []
      }
    ],
    "questions_to_ask": [
      {
        "question": "string",
        "why_its_smart": "string (why this impresses)",
        "what_to_listen_for": "string (red/green flags in their answer)"
      }
    ],
    "red_flags": [
      {
        "flag": "string",
        "what_it_means": "string",
        "what_to_do": "string"
      }
    ],
    "salary_tip": {
      "tip": "string",
      "example_phrase": "string (exact words to say)"
    },
    "total_questions": number,
    "confidence_boost": "string (motivational closing message)"
  }
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId, difficulty = 'intermediate' } = body;

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Missing analysisId' },
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
    const prompt = INTERVIEW_PREP_PROMPT
      .replace('{job_title}', analysis.job_title)
      .replace('{company_name}', analysis.company_name)
      .replace('{requirements}', "Extracted from job description")
      .replace('{responsibilities}', "As described in job description")
      .replace('{skills}', "As described in job description")
      .replace('{name}', "The Candidate")
      .replace('{currentTitle}', "Candidate")
      .replace('{yearsExperience}', "relevant")
      .replace('{user_skills}', "relevant skills matching the job")
      .replace('{experience}', "relevant experience matching the job")
      .replace('{difficulty}', difficulty);

    // Append job description for context
    // Truncate to 2000 chars to avoid token limits with some providers
    const fullPrompt = `${prompt}\n\nJOB DESCRIPTION:\n${analysis.job_description.substring(0, 2000)}`;

    console.log(`[API] Generating Interview Prep (Difficulty: ${difficulty}). Prompt Length: ${fullPrompt.length}`);

    // 3. Call OpenAI
    let aiResponse;
    try {
      aiResponse = await getLLMResponse(
        createConversation(fullPrompt, "Generate the JSON."),
        { temperature: 0.7, maxTokens: 2500 }
      );
    } catch (llmError) {
      console.error('[API] LLM Call Failed:', llmError);
      return NextResponse.json(
        { error: `AI Generation Failed: ${llmError instanceof Error ? llmError.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    // 4. Parse Response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

    let prepData;
    try {
      prepData = JSON.parse(aiResponse);
    } catch (e) {
      console.error('[API] JSON Parse Error:', e);
      console.error('[API] Raw Response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to generate valid JSON for Interview Prep' },
        { status: 500 }
      );
    }

    return NextResponse.json(prepData);

  } catch (error) {
    console.error('[API] Interview Prep Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
