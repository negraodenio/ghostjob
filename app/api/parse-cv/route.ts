import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';
// @ts-ignore
import pdf from 'pdf-parse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CV_PARSING_PROMPT = `You are an expert HR data extraction system.
Extract the following information from this resume text and return it as a structured JSON object.

Required JSON Structure:
{
  "full_name": "Applicant Name",
  "phone": "Phone number",
  "location": "City, State",
  "professional_summary": "A brief 2-3 sentence summary of their profile",
  "work_experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "period": "Start Date - End Date",
      "description": "Brief description of responsibilities/achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/School",
      "year": "Graduation Year"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "languages": ["Language 1", "Language 2"],
  "certifications": ["Cert 1", "Cert 2"],
  "portfolio_url": "URL to portfolio or LinkedIn"
}

If any field is completely missing from the resume, leave it as an empty string or empty array.
Make sure the JSON is valid. Keep descriptions concise.

RESUME TEXT:
`;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Parse PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        const pdfData = await pdf(buffer);
        const rawText = pdfData.text;

        if (!rawText || rawText.trim().length < 50) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
        }

        // Call LLM
        let aiResponse = await getLLMResponse(
            createConversation(CV_PARSING_PROMPT, rawText.substring(0, 15000)),
            { temperature: 0.1, maxTokens: 2500 }
        );

        // Clean response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

        const extractedData = JSON.parse(aiResponse);

        // Update profile (if logged in)
        if (user) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: extractedData.full_name || null,
                    phone: extractedData.phone || null,
                    location: extractedData.location || null,
                    professional_summary: extractedData.professional_summary || null,
                    work_experience: extractedData.work_experience || [],
                    education: extractedData.education || [],
                    skills: extractedData.skills || [],
                    languages: extractedData.languages || [],
                    certifications: extractedData.certifications || [],
                    portfolio_url: extractedData.portfolio_url || null,
                    raw_resume_text: rawText
                })
                .eq('id', user.id);

            if (updateError) {
                console.warn('[API] Database error updating profile (non-critical):', updateError);
            }
        }

        return NextResponse.json({ success: true, data: extractedData });
    } catch (error) {
        console.error('[API] CV Parsing error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
