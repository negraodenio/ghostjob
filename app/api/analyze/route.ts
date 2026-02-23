import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLLMResponse, createConversation } from '@/lib/llm';
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

interface GhostAnalysisResult {
    company_name: string;
    job_title: string;
    confidence_score: number;
    posting_age_days: number;
    ghost_score: number;
    ghost_verdict: 'legit' | 'sus' | 'ghost' | 'certified_ghost';
    ghost_headline: string;
    ghost_roast: string;
    top_reasons: string[];
    scoring_breakdown: {
        base_score: number;
        age_multiplier: number;
        red_flags_total_points: number;
        green_flags_discount: number;
        cross_validation_penalty: number;
        final_score: number;
    };
    job_quality: JobQuality & { overall: number };
    deep_analysis: {
        content_quality: string;
        risk_factors: string;
        credibility_signals: string;
        market_context?: string;
    };
    recommendation: {
        action: 'apply_now' | 'research_first' | 'skip' | 'avoid' | 'report_scam';
        next_steps: string;
        warning_level: 'safe' | 'caution' | 'danger' | 'critical';
        time_investment?: number;
    };
    red_flags: RedFlag[];
    green_flags: GreenFlag[];
    combo_flags: {
        detected: string[];
        auto_verdict_triggered: boolean;
        explanation: string;
    };
    temporal_analysis?: {
        posted_days_ago: number;
        age_category: string;
        repost_detected: boolean;
        repost_count: number;
    };
}

const GHOST_ANALYSIS_PROMPT = `Analyze this job description for signs of being a ghost job with extreme precision.

# CONTEXT (CRITICAL HINTS)
- Job Title: {title_hint}
- Company: {company_hint}
- Time Posted: {posted_hint} ← PARSE THIS for age calculation

# MISSION
Detect impossible requirements, vague language, temporal red flags, phishing, and "Evergreen Fake Hiring" patterns.

---

## STEP 1: TEMPORAL ANALYSIS (CRITICAL)

**Parse {posted_hint} to extract posting age in days.**

Example inputs:
- "2 days ago" → 2 days
- "Posted 3 months ago" → ~90 days
- "6w ago" → ~42 days

**Apply Age Multiplier:**
\`\`\`
0-7 days:    1.0x (fresh, normal)
8-30 days:   1.1x (slightly stale)
31-60 days:  1.4x (suspicious)
61-90 days:  1.7x (very suspicious)  
90+ days:    2.2x (EXTREME red flag)
\`\`\`

If "reposted" appears → add +0.3x to multiplier

---

## STEP 2: TECH REALITY CHECK (KNOWLEDGE BASE)

**Technology Age Reference:**
- React: 2013 | Vue: 2014 | Flutter: 2017 | Swift: 2014
- Kubernetes: 2014 | TypeScript: 2012 | Next.js: 2016
- GPT/LLMs: 2022 | Rust: 2010 | Go: 2009

**RULE:**
IF (required_years > tech_age) → **WEIGHT 5 (CRITICAL)** "Impossible Requirements"

---

## STEP 3: STARTUP CONTEXT DETECTION

IF detected as:
- < 30 employees OR
- "Seed/Series A" OR  
- "Early Stage Startup" OR
- Founded < 2 years ago

**THEN:**
- Reduce weight of "Vague Responsibilities" by 50%
- Reduce weight of "Unicorn Syndrome" by 30%
- Startups naturally have fluid roles

---

## STEP 4: RED FLAGS DETECTION

### 🔴 WEIGHT 5 (CRITICAL - 20pts each)

1. **Impossible Tech Requirements**
   - Required experience > technology age
   
2. **Phishing Signals**
   - SSN/ID requested before interview
   - Personal banking info upfront
   
3. **Extreme Title/Description Mismatch**
   - "Junior" title but requires "10+ years"
   - "Entry-level" but needs "Lead 5+ people"

4. **Ancient Posting**
   - 90+ days old (auto-detected from {posted_hint})
   
5. **Payment/Fee Required**
   - Training fee
   - "Investment required"

---

### 🟠 WEIGHT 3 (HIGH - 15pts each)

6. **Missing Compensation**
   - No salary range at all
   
7. **Unicorn Syndrome**
   - 8+ unrelated skills required
   - Expert in competing frameworks (React + Angular + Vue)

8. **Salary Absurdity**
   - Range > 3x difference ("$40k-$150k")
   - Senior title with junior pay

9. **Stale Posting**
   - 60-89 days old
   
10. **Multiple Reposts**
    - Text mentions "reposted" 2+ times
    
11. **No Company Presence**
    - No verifiable website
    - No LinkedIn page
    - Zero online footprint

12. **Staffing Agency Vagueness**
    - "Hiring for client" with zero client details

---

### 🟡 WEIGHT 2 (MEDIUM - 10pts each)

13. **Vague Responsibilities**
    - "Various tasks as assigned"
    - Only generic bullets
    
14. **Buzzword Overload**
    - 5+ of: rockstar, ninja, guru, disruptive, synergy

15. **Title/Description Contradiction**
    - Title says "Remote" but description requires relocation
    - Different seniority levels

16. **No Interview Process**
    - Zero mention of hiring steps

17. **Generic Company Bio**
    - Copy-paste boilerplate

---

### 🟢 WEIGHT 1 (LOW - 5pts each)

18. **Robotic/Template Tone**
    - Excessive passive voice
    - Repetitive sentence structures

19. **Cliché Overload**
    - "Fast-paced environment"
    - "We're like a family"
    - "Wear many hats"

20. **No Team/Manager Named**
    - Generic "HR team" contact
    - noreply@ email

---

## STEP 5: GREEN FLAGS (Subtract points)

### ✅ WEIGHT -15pts each

1. **Transparent Compensation**
   - Specific salary range listed
   
2. **Named Personnel**
   - Hiring manager name + LinkedIn
   
3. **Specific Tech Stack**
   - Exact versions ("React 18, TypeScript 5.2")
   
4. **Detailed Interview Process**
   - "3 rounds: technical, behavioral, cultural"

5. **Recent Company News**
   - Verifiable recent event mentioned

---

## STEP 6: COMBO DETECTION (Auto-Verdicts)

**These combinations BYPASS normal scoring:**

### 🚨 INSTANT CERTIFIED_GHOST:
- Missing salary + 90+ days old + vague duties
- Impossible requirements + no company presence + 60+ days
- Phishing signals + third-party redirect

### ⚠️ INSTANT GHOST (set score to 75):
- No salary + unicorn syndrome + 60+ days stale
- Staffing agency + no client + 45+ days

### 🆘 SCAM WARNING (special flag):
- Payment required + "work from home" emphasis
- Personal banking info before offer

---

## STEP 7: CROSS-VALIDATION

Check for internal contradictions:
- Title seniority ≠ description seniority → +15pts
- Location contradiction (remote vs relocate) → +15pts
- Salary in title ≠ description → +10pts

---

## STEP 8: FINAL SCORING
\`\`\`
BASE_SCORE = Sum(RedFlagWeights) - Sum(GreenFlagWeights)
FINAL_SCORE = min(100, max(0, BASE_SCORE × AgeMultiplier))
\`\`\`

### VERDICT THRESHOLDS:
\`\`\`
0-25:   legit (apply with confidence)
26-50:  sus (research company first)
51-75:  ghost (probably fake, low priority)
76-100: certified_ghost (definitely fake, avoid)
\`\`\`

---

## STEP 9: JSON OUTPUT
\`\`\`json
{
  "company_name": "string",
  "job_title": "string",
  "posting_age_days": 0,
  "ghost_score": 0-100,
  "ghost_verdict": "legit|sus|ghost|certified_ghost",
  "ghost_headline": "8-12 word punchy summary",
  "ghost_roast": "2-3 sentences. Witty for ghosts, encouraging for legit",
  "top_reasons": ["Reason 1", "Reason 2", "Reason 3"],
  
  "scoring_breakdown": {
    "base_score": 0,
    "age_multiplier": 1.0,
    "red_flags_total": 0,
    "green_flags_discount": 0,
    "final_score": 0
  },
  
  "job_quality": {
    "clarity": 0-100,
    "realism": 0-100,
    "transparency": 0-100,
    "overall": 0-100
  },
  
  "deep_analysis": {
    "content_quality": "2-3 sentences on authenticity",
    "risk_factors": "Top 3 red flags found",
    "credibility_signals": "Positive indicators (if any)"
  },
  
  "recommendation": {
    "action": "apply_now|research_first|skip|avoid",
    "next_steps": "Specific actionable advice",
    "warning_level": "low|medium|high|critical"
  },
  
  "red_flags": [
    {
      "title": "Flag name",
      "explanation": "Why triggered",
      "weight": 1-5,
      "severity": "critical|high|medium|low"
    }
  ],
  
  "green_flags": [
    {
      "title": "Positive signal",
      "explanation": "What was good",
      "weight": 1-5
    }
  ],
  
  "combo_flags": {
    "detected": ["combo_type"],
    "auto_verdict_triggered": false,
    "explanation": "Why combo is dangerous"
  }
}
\`\`\`

---

## TONE GUIDELINES

**For legit jobs (0-25):**
- Encouraging but realistic
- "This looks solid. Here's what stood out..."

**For sus jobs (26-50):**
- Balanced, analytical
- "Some red flags. Here's what to verify..."

**For ghost jobs (51-75):**
- Direct but helpful
- "High probability of being fake. Here's why..."

**For certified ghost (76-100):**
- Protective, firm
- "This is a ghost job. Don't waste your time."

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
                console.log('[API] Fetching job description from URL using Jina:', job_url);
                const response = await fetch(`https://r.jina.ai/${job_url}`, {
                    headers: {
                        'Accept': 'text/plain', // Return markdown text
                    },
                    signal: AbortSignal.timeout(15000) // 15s timeout
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
                    console.warn(`[API] Failed to fetch URL with Jina: ${response.status}`);
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

        // Call LLM for analysis
        console.log('[API] Starting ghost job analysis...');
        const fullPrompt = GHOST_ANALYSIS_PROMPT
            .replace('{title_hint}', body.title_hint || 'None')
            .replace('{company_hint}', body.company_hint || 'None')
            .replace('{posted_hint}', body.posted_hint || 'Just now');

        let aiResponse = await getLLMResponse(
            createConversation(fullPrompt, finalJobDescription),
            { temperature: 0.7, maxTokens: 4000 }
        );

        console.log('[API] Raw AI response:', aiResponse);

        // Clean response (extract JSON object)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        aiResponse = jsonMatch ? jsonMatch[0] : aiResponse;

        // Parse AI response
        let analysisResult: GhostAnalysisResult;
        try {
            // Check if AI explicitly rejected it (e.g. login page detected)
            if (aiResponse.includes('NOT A JOB DESCRIPTION') || aiResponse.includes('LOGIN PAGE')) {
                return NextResponse.json(
                    { error: 'Facepalm! 🤦‍♂️ O link enviado parece ser uma página de login ou conteúdo privado. Tente copiar e colar a descrição manualmente na extensão.' },
                    { status: 400 }
                );
            }

            analysisResult = JSON.parse(aiResponse);
        } catch (parseError) {
            console.error('[API] Failed to parse AI response:', parseError);
            console.error('[API] Response that failed parsing:', aiResponse);

            // If it's not JSON but we can see a verdict, try to be helpful
            if (aiResponse.length < 500) {
                return NextResponse.json(
                    { error: `Ocorreu um erro na análise: ${aiResponse.substring(0, 100)}... Tente novamente.` },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { error: 'Falha ao processar a resposta da IA. Tente novamente em instantes.' },
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
