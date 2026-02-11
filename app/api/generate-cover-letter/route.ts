import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const COVER_LETTER_PROMPT = `You are an expert cover letter writer who creates personalized, compelling cover letters that get interviews.

USER PROMPT:
"Write a cover letter for this candidate applying to this specific job.

TARGET JOB:
- Title: {job_title}
- Company: {company_name}
- Requirements: {requirements}
- Responsibilities: {responsibilities}

CANDIDATE:
- Name: {name}
- Current Title: {currentTitle}
- Years of Experience: {yearsExperience}
- Skills: {skills}
- Experience: {experience}
- Education: {education}

TONE: {tone}
- professional: Formal, structured, corporate. Use industry terminology. Measured confidence.
- friendly: Warm, personable, shows genuine enthusiasm. Conversational but still professional.
- bold: Highly confident, makes strong claims, uses powerful language. Stands out from typical letters.

RULES:
1. NEVER start with 'Dear Hiring Manager' — address the {company_name} team or department instead
2. NEVER use 'I am writing to express my interest' — this is the most generic opening ever
3. Open with something that grabs attention
4. Reference 2-3 SPECIFIC requirements from the job posting
5. Connect candidate experience directly to job needs
6. Show genuine knowledge/interest in THIS company
7. Keep under 350 words
8. End with a confident call to action
9. If candidate didn't provide enough details, create compelling content marked with [EDIT THIS]
10. Make it feel HUMAN, not template-generated

Return ONLY valid JSON:
{
  "cover_letter": {
    "greeting": "string",
    "paragraphs": [
      "Opening paragraph - attention grabber",
      "Body paragraph 1 - relevant experience",
      "Body paragraph 2 - specific skills match",
      "Closing paragraph - call to action"
    ],
    "closing": "string (e.g. Best regards,)",
    "full_text": "string (complete letter as single text)",
    "word_count": number,
    "tone_used": "string",
    "requirements_addressed": [
      "requirement 1 from job",
      "requirement 2 from job"
    ],
    "strengths": [
      "What makes this letter strong"
    ],
    "tips": [
      "How to make it even better"
    ]
  }
}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { analysisId, userInfo, tone = 'professional' } = body;

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
        const prompt = COVER_LETTER_PROMPT
            .replace('{job_title}', analysis.job_title)
            .replace('{company_name}', analysis.company_name)
            .replace('{requirements}', "Extracted from job description")
            .replace('{responsibilities}', "As described in job description")
            .replace('{name}', userInfo.fullName)
            .replace('{currentTitle}', userInfo.currentTitle)
            .replace('{yearsExperience}', userInfo.yearsExperience.toString())
            .replace('{skills}', userInfo.skills || 'Not provided')
            .replace('{experience}', userInfo.experience || 'Not provided')
            .replace('{education}', userInfo.education || 'Not provided')
            .replace('{tone}', tone);

        // Append job description for context
        // Append job description for context
        const fullPrompt = `${prompt}\n\nJOB DESCRIPTION:\n${analysis.job_description.substring(0, 2000)}`;

        console.log(`[API] Generating Cover Letter (Tone: ${tone})...`);

        // 3. Call OpenAI
        let aiResponse = await getLLMResponse(
            createConversation(fullPrompt, "Generate the JSON."),
            { temperature: 0.7, maxTokens: 1500 }
        );

        // 4. Parse Response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

        let letterData;
        try {
            letterData = JSON.parse(aiResponse);
        } catch (e) {
            console.error('[API] JSON Parse Error:', e);
            console.error('[API] Raw Response:', aiResponse);
            return NextResponse.json(
                { error: 'Failed to generate valid JSON for Cover Letter' },
                { status: 500 }
            );
        }

        return NextResponse.json(letterData);

    } catch (error) {
        console.error('[API] Cover Letter Generation error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
