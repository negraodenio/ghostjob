import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createConversation } from '@/lib/llm';
import { checkRateLimit, incrementAnalysisCount } from '@/lib/rate-limit';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RedFlag {
    title: string;
    explanation: string;
    severity?: 'high' | 'medium' | 'low';
    weight: number;
}

interface GreenFlag {
    title: string;
    explanation: string;
    weight?: number;
}

interface JobQuality {
    clarity: number;
    realism: number;
    transparency: number;
}

// Unused interface removed

// Unused prompt constant removed
 is a ghost job. Don't waste your time."

`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { job_description, job_url } = body;

        // Use a mutable variable for the description
        let finalJobDescription = job_description || '';

        // Check if we need to fetch from URL
        if (finalJobDescription.trim().length < 200 && job_url) {
            try {
                // Normalize LinkedIn URL (handle search/collection URLs)
                let targetUrl = job_url;
                if (job_url.includes('linkedin.com')) {
                    const urlObj = new URL(job_url);
                    const currentJobId = urlObj.searchParams.get('currentJobId');
                    if (currentJobId) {
                        targetUrl = `https://www.linkedin.com/jobs/view/${currentJobId}/`;
                        console.log('[API] Normalized LinkedIn URL to direct job view:', targetUrl);
                    }
                }

                // Encode the URL to handle special characters correctly
                const encodedUrl = encodeURIComponent(targetUrl);
                console.log('[API] Fetching job description from URL using Jina:', targetUrl);

                const response = await fetch(`https://r.jina.ai/${encodedUrl}`, {
                    headers: {
                        'Accept': 'text/plain', // Return markdown text
                        'X-No-Cache': 'true',   // Optional: bypass Jina cache if needed
                    },
                    signal: AbortSignal.timeout(15000) // Increased to 15s for better reliability
                });

                if (response.ok) {
                    const text = await response.text();

                    if (text && text.length > 200) {
                        finalJobDescription = text.substring(0, 15000); // Limit to 15k chars
                        console.log('[API] Successfully extracted text with Jina. Length:', finalJobDescription.length);
                    } else {
                        console.warn('[API] Extracted text from Jina was too short.');
                    }
                } else {
                    console.warn(`[API] Failed to fetch URL with Jina: ${response.status} ${response.statusText}`);
                }
            } catch (error) {
                console.error('[API] Jina URL Fetch Error:', error);
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

        // 4. Extract Features via Decision Engine (LLM as Feature Extractor)
        const { extractFeatures } = await import('@/lib/analysis/feature-extractor');
        const { calculateGhostScore } = await import('@/lib/analysis/scoring-engine');

        console.log('[API] Starting feature extraction...');
        const features = await extractFeatures(finalJobDescription, {
            title: body.title_hint,
            company: body.company_hint,
            posted: body.posted_hint
        });

        console.log('[API] Extracted Features:', features);

        // 5. Calculate Score Deterministically
        const scoringData = calculateGhostScore(features);

        const analysisResult = {
            company_name: features.extracted_company_name,
            job_title: features.extracted_job_title,
            ghost_score: scoringData.ghost_score,
            ghost_verdict: scoringData.ghost_verdict as 'legit' | 'sus' | 'ghost' | 'certified_ghost',
            ghost_headline: scoringData.ghost_headline,
            ghost_roast: `Based on a deterministic analysis of ${Object.keys(features).length} variables.`,
            red_flags: scoringData.red_flags,
            green_flags: scoringData.green_flags,
            job_quality: { clarity: 100 - (features.vague_language_score * 100), realism: 100, transparency: features.has_salary ? 100 : 0, overall: 100 - scoringData.ghost_score },
            recommendation: { action: 'research_first' as const, next_steps: scoringData.combo_flags.explanation, warning_level: 'caution' as const },
            posting_age_days: features.job_age_days,
            confidence_score: 90, // Default confidence for deterministic analysis
            scoring_breakdown: {
                base_score: scoringData.ghost_score,
                age_multiplier: 1,
                red_flags_total_points: 0,
                green_flags_discount: 0,
                cross_validation_penalty: 0,
                final_score: scoringData.ghost_score
            },
            deep_analysis: {
                content_quality: "Deterministic extraction complete.",
                risk_factors: scoringData.red_flags.map(f => f.title).join(', '),
                credibility_signals: scoringData.green_flags.map(f => f.title).join(', ')
            },
            combo_flags: scoringData.combo_flags,
            temporal_analysis: {
                posted_days_ago: features.job_age_days,
                age_category: 'normal',
                repost_detected: features.repost_count > 0,
                repost_count: features.repost_count
            }
        };

        console.log('[API] Deterministic Scoring Complete', { score: analysisResult.ghost_score, verdict: analysisResult.ghost_verdict });

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

        // Create or Find Company (Normalization)
        const company_name_raw = analysisResult.company_name || 'Unknown Company';
        const normalized_company_name = company_name_raw
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');

        let companyId = null;

        if (normalized_company_name) {
            // Check if company exists
            const { data: existingCompany } = await supabase
                .from('companies')
                .select('id')
                .eq('normalized_name', normalized_company_name)
                .single();

            if (existingCompany) {
                companyId = existingCompany.id;
            } else {
                // Create new company
                const { data: newCompany, error: companyError } = await supabase
                    .from('companies')
                    .insert({
                        name: analysisResult.company_name,
                        normalized_name: normalized_company_name
                    })
                    .select('id')
                    .single();

                if (!companyError && newCompany) {
                    companyId = newCompany.id;
                }
            }
        }

        // Generate Job Description Hash for deduplication
        const jd_hash = crypto
            .createHash('sha256')
            .update(finalJobDescription.trim())
            .digest('hex');

        // 5. Upsert Job (centralizing analysis per JD)
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .upsert({
                company_id: companyId,
                job_title: analysisResult.job_title,
                job_description: finalJobDescription.trim(),
                job_description_hash: jd_hash,
                ghost_score: analysisResult.ghost_score,
                ghost_verdict: analysisResult.ghost_verdict,
                confidence_score: analysisResult.confidence_score,
                clarity_score: analysisResult.job_quality.clarity,
                realism_score: analysisResult.job_quality.realism,
                transparency_score: analysisResult.job_quality.transparency,
                red_flags: analysisResult.red_flags,
                green_flags: analysisResult.green_flags,
                last_seen_at: new Date().toISOString(),
            }, { onConflict: 'job_description_hash' })
            .select()
            .single();

        if (jobError) {
            console.error('[API] Job upsert error:', jobError);
        }

        const applicationData = {
            user_id: user?.id || null,
            job_id: job?.id || null,
            company_id: companyId,
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
            ghost_advice: analysisResult.recommendation.next_steps, // Map to existing field
            parsed_jd: {
                posting_age_days: analysisResult.posting_age_days,
                confidence_score: analysisResult.confidence_score,
                scoring_breakdown: analysisResult.scoring_breakdown,
                deep_analysis: analysisResult.deep_analysis,
                recommendation: analysisResult.recommendation,
                combo_flags: analysisResult.combo_flags,
                temporal_analysis: analysisResult.temporal_analysis
            },
            is_public: false,
            upvotes: 0,
        };

        // Use admin client to bypass RLS for anonymous scans (user_id = null)
        const { createAdminClient } = await import('@/lib/supabase/admin');
        const adminSupabase = createAdminClient();

        const { data: application, error: dbError } = await adminSupabase
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
