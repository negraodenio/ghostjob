import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';
import { checkRateLimit, incrementAnalysisCount } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RedFlag {
    title: string;
    explanation: string;
    why_it_matters: string;
    severity: 'high' | 'medium' | 'low';
}

interface GreenFlag {
    title: string;
    explanation: string;
    why_good: string;
}

interface JobQuality {
    clarity: number;
    realism: number;
    transparency: number;
    overall: number;
}

interface GhostAnalysisResult {
    company_name: string;
    job_title: string;
    ghost_score: number;
    ghost_verdict: 'legit' | 'sus' | 'ghost' | 'certified_ghost';
    ghost_headline: string;
    ghost_roast: string;
    red_flags: RedFlag[];
    green_flags: GreenFlag[];
    job_quality: JobQuality;
    ghost_advice: string;
}

const GHOST_ANALYSIS_PROMPT = `You are an expert HR analyst and job market researcher specializing in detecting ghost job postings.

Analyze this job description for signs of being a ghost job (fake posting not intended to fill a real position).

Check for these 15+ red flags:
1. Impossible requirements (e.g., 10 years experience in technology that's only 5 years old)
2. Unicorn candidate syndrome (too many unrelated skills required)
3. Vague responsibilities ("various tasks", "other duties as assigned" without specifics)
4. Missing salary/compensation information
5. Excessive buzzwords without substance
6. Junior pay expectations + senior requirements mismatch
7. Signs of reposting (stale language patterns, "ongoing need")
8. Generic copy-paste description (could apply to any company)
9. No team structure or reporting manager mentioned
10. "Fast-paced environment" without any specifics about the work
11. Says remote but requires specific physical location
12. 20+ requirement bullet points
13. No benefits, growth, or career path mentioned
14. Contradictory requirements
15. Generic company description (could be any company in the industry)

Also identify green flags (positive signals):
- Specific technical stack mentioned
- Clear day-to-day responsibilities
- Named team members or reporting structure
- Transparent salary range
- Realistic requirements
- Detailed company information
- Clear application process

For each flag found, provide:
- Title (brief)
- Explanation (one sentence)
- Why It Matters/Why Good: A short sentence explaining the impact on the candidate
- Severity: high/medium/low (for red flags only)

Calculate sub-scores (0-100):
- Clarity: How well-defined are the roles and responsibilities?
- Realism: Are the requirements realistic and achievable?
- Transparency: Is compensation and company info transparent?
- Overall Ghost Score: 0-100 (0 = definitely real, 100 = definitely ghost)

Determine verdict:
- legit (0-30): This looks like a real job
- sus (31-60): Some red flags but might be real
- ghost (61-85): Likely a ghost job
- certified_ghost (86-100): Definitely a ghost job

Generate Headline & Roast/Hype:
- ghost_headline:
  - If score > 60: A snappy, snarky 3-5 word headline (e.g., "Run Away Fast 🚩", "Spectral Nonsense 👻")
  - If score <= 60: A positive, encouraging headline (e.g., "Looks Promising! 🚀", "Apply Now! ✅")
- ghost_roast:
  - If score > 60: 2-3 sentences roasting the job posting (funny, sarcastic, but not mean)
  - If score <= 60: 2-3 sentences hyping up the job and why it looks good

Return ONLY valid JSON in this exact format:
{
  "company_name": "extracted company name or 'Unknown Company'",
  "job_title": "extracted job title or 'Unknown Position'",
  "ghost_score": 0-100,
  "ghost_verdict": "legit|sus|ghost|certified_ghost",
  "ghost_headline": "snappy headline",
  "ghost_roast": "roast paragraph (or hype paragraph)",
  "red_flags": [{"title": "...", "explanation": "...", "why_it_matters": "...", "severity": "high|medium|low"}],
  "green_flags": [{"title": "...", "explanation": "...", "why_good": "..."}],
  "job_quality": {"clarity": 0-100, "realism": 0-100, "transparency": 0-100, "overall": 0-100},
  "ghost_advice": "brief advice for the job seeker"
}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { job_description, job_url } = body;

        // Use a mutable variable for the description
        let finalJobDescription = job_description || '';

        // Check if we need to fetch from URL
        if (finalJobDescription.trim().length < 200 && job_url) {
            try {
                console.log('[API] Fetching job description from URL:', job_url);
                const response = await fetch(job_url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    signal: AbortSignal.timeout(10000) // 10s timeout
                });

                if (response.ok) {
                    const html = await response.text();

                    // Basic HTML stripping
                    const text = html
                        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                        .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                        .replace(/<[^>]+>/g, "\n")
                        .replace(/\s+/g, " ")
                        .trim();

                    if (text.length > 200) {
                        finalJobDescription = text.substring(0, 15000); // Limit to 15k chars
                        console.log('[API] Successfully extracted text from URL. Length:', finalJobDescription.length);
                    } else {
                        console.warn('[API] Extracted text from URL was too short.');
                    }
                } else {
                    console.warn(`[API] Failed to fetch URL: ${response.status}`);
                }
            } catch (error) {
                console.error('[API] URL Fetch Error:', error);
            }
        }

        // Validation
        if (!finalJobDescription || finalJobDescription.trim().length < 200) {
            return NextResponse.json(
                { error: 'Job description (or content fetched from URL) must be at least 200 characters' },
                { status: 400 }
            );
        }

        // Get user (if authenticated)
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        // Check rate limits
        const rateLimit = await checkRateLimit(user?.id);
        if (!rateLimit.allowed) {
            return NextResponse.json(
                { error: rateLimit.message || 'Rate limit exceeded' },
                { status: 429 }
            );
        }

        // Call LLM for analysis
        console.log('[API] Starting ghost job analysis...');
        let aiResponse = await getLLMResponse(
            createConversation(GHOST_ANALYSIS_PROMPT, finalJobDescription),
            { temperature: 0.7, maxTokens: 3000 }
        );

        console.log('[API] Raw AI response:', aiResponse);

        // Clean response (extract JSON object)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

        // Parse AI response
        let analysisResult: GhostAnalysisResult;
        try {
            analysisResult = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('[API] Failed to parse AI response:', parseError);
            console.error('[API] Response that failed parsing:', aiResponse);
            return NextResponse.json(
                { error: 'Failed to analyze job posting. Please try again.' },
                { status: 500 }
            );
        }

        // Save to database
        // Ensure profile exists if user is logged in (to satisfy foreign key constraint)
        if (user?.id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', user.id)
                .single();

            if (!profile) {
                console.log('[API] Creating missing profile for user:', user.id);
                const { error: profileInsertError } = await supabase
                    .from('profiles')
                    .insert({
                        id: user.id,
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    });

                if (profileInsertError) {
                    console.error('[API] Failed to create missing profile:', profileInsertError);
                    // We continue, but the application insert might fail if it's a FK violation
                }
            }
        }

        const applicationData = {
            user_id: user?.id || null,
            job_description: finalJobDescription.trim(),
            job_url: job_url || null,
            company_name: analysisResult.company_name,
            job_title: analysisResult.job_title,
            ghost_score: analysisResult.ghost_score,
            ghost_verdict: analysisResult.ghost_verdict,
            ghost_headline: analysisResult.ghost_headline || null,
            ghost_roast: analysisResult.ghost_roast || null,
            red_flags: analysisResult.red_flags,
            green_flags: analysisResult.green_flags,
            job_quality: analysisResult.job_quality,
            ghost_advice: analysisResult.ghost_advice,
            is_public: false,
            upvotes: 0,
        };

        const { data: application, error: dbError } = await supabase
            .from('applications')
            .insert(applicationData)
            .select()
            .single();

        if (dbError) {
            console.error('[API] Database error:', dbError);
            return NextResponse.json(
                { error: `Failed to save analysis: ${dbError.message || JSON.stringify(dbError)}` },
                { status: 500 }
            );
        }

        // Increment analysis count for authenticated users
        if (user?.id) {
            await incrementAnalysisCount(user.id);
        }

        console.log('[API] Analysis complete:', application.id);

        return NextResponse.json({
            id: application.id,
            ...analysisResult,
        });

    } catch (error) {
        console.error('[API] Analysis error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 500 }
        );
    }
}
