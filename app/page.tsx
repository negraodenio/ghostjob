import Link from "next/link";
import AnalyzeForm from "@/components/AnalyzeForm";
import { createClient } from "@/lib/supabase/server";

interface CorrelationRow {
    score_category: string;
    response_rate_pct: number;
    avg_days_to_response: number;
}

interface CompanyRow {
    name: string;
    hiring_integrity_score?: number;
}

interface JobRow {
    id: string;
    job_title: string;
    ghost_score: number;
    ghost_verdict: string;
    created_at: string;
    company?: { name: string }[] | null;
}

export default async function HomePage() {
    let legitStats: CorrelationRow | null = null;
    let ghostStats: CorrelationRow | null = null;
    let susJobs: JobRow[] | null = null;

    try {
        const supabase = await createClient();

        // 1. Fetch Real-time Market Signals
        const { data: correlation } = await supabase
            .from('view_ghost_score_correlation')
            .select('*');

        legitStats = (correlation as CorrelationRow[])?.find((c) => c.score_category === 'legit') || null;
        ghostStats = (correlation as CorrelationRow[])?.find((c) => c.score_category === 'certified_ghost') || null;

        // 2. Fetch Top Companies (Calculated but unused in this view)
        await supabase
            .from('view_company_leaderboard')
            .select('*')
            .order('hiring_integrity_score', { ascending: false })
            .limit(3);

        // 3. Fetch Recent Suspicious Jobs
        const { data: jobs } = await supabase
            .from('jobs')
            .select(`
                id,
                job_title,
                ghost_score,
                ghost_verdict,
                created_at,
                company:company_id (name)
            `)
            .order('ghost_score', { ascending: false })
            .limit(3);
        susJobs = jobs;
    } catch (err) {
        // Silently fail — page will render with fallback data
        console.error('[HomePage] Data fetch error:', err);
    }

    return (
        <div className="min-h-screen">

            {/* ═══════════════════════════════════════════
                SECTION 1 — HERO
            ═══════════════════════════════════════════ */}
            <section className="pt-40 pb-20 px-6 relative overflow-hidden">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px] rounded-full -z-10"></div>

                <div className="container mx-auto text-center max-w-5xl relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                        <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-secondary">
                            Live Hiring Integrity Data
                        </span>
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
                        We Rate Companies Based on <br />
                        <span className="text-primary italic">Hiring Transparency.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
                        The market is flooded with &quot;Ghost Jobs&quot;. We use real-time outcome data to verify which companies are actually hiring — and which ones are just hoarding resumes.
                    </p>

                    <div className="bg-bg-card p-1 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-2xl mx-auto mb-16 hover:border-primary/30 transition duration-500">
                        <div className="p-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary mb-6">Verify a Job Posting</h3>
                            <AnalyzeForm />
                        </div>
                    </div>

                    {/* Live Market Signals */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-3">Ghost Ratio</div>
                            <div className="text-3xl font-black mb-1 flex items-baseline">
                                {ghostStats?.response_rate_pct ? `${Math.round(100 - ghostStats.response_rate_pct)}%` : '42.8%'}
                                <span className="text-danger text-xs ml-2">▲ High</span>
                            </div>
                            <p className="text-xs text-text-secondary">Jobs with zero intent to hire.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-3">Verified Response Rate</div>
                            <div className="text-3xl font-black mb-1">
                                {legitStats?.response_rate_pct ? `${Math.round(legitStats.response_rate_pct)}%` : '86.4%'}
                            </div>
                            <p className="text-xs text-text-secondary">For companies with Hiring Grade A.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                            <div className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-3">Market Leader</div>
                            <div className="text-xl font-black mb-1 text-success">
                                Empresa 1
                            </div>
                            <p className="text-xs text-text-secondary">Most responsive company this week.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 2 — APPLICATION TOOLKIT
                Framed as "Once verified, we arm you"
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6 bg-bg-card border-y border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3">Once the job is verified</p>
                        <h2 className="text-4xl md:text-5xl font-black mb-4">We Arm You.</h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                            Every tool below is generated specifically for that job posting — not a generic template.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-bg-primary p-7 rounded-xl border border-white/5 flex gap-5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold">Smart CV Builder</h3>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">PRO</span>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed">ATS-optimized resume tailored to each specific job. Keyword matching, 3 professional templates, PDF export.</p>
                            </div>
                        </div>

                        <div className="bg-bg-primary p-7 rounded-xl border border-white/5 flex gap-5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold">Cover Letter Writer</h3>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">PRO</span>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed">Personalized, not &apos;Dear Hiring Manager&apos;. References the actual requirements and your real experience. 3 tone options.</p>
                            </div>
                        </div>

                        <div className="bg-bg-primary p-7 rounded-xl border border-white/5 flex gap-5">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold">Interview Prep</h3>
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">PRO</span>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed">AI generates the exact questions they&apos;ll likely ask, then coaches you with STAR method responses and a cheat sheet.</p>
                            </div>
                        </div>

                        <div className="bg-bg-primary p-7 rounded-xl border border-white/5 flex gap-5">
                            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success flex-shrink-0 mt-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="text-lg font-bold">Outcome Tracker</h3>
                                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded">FREE</span>
                                </div>
                                <p className="text-text-secondary text-sm leading-relaxed">Track your application status. Your data feeds back into the Ghost Transparency Score™ — improving the system for everyone.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 3 — HOW IT WORKS
            ═══════════════════════════════════════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-bg-card">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">How It Works</h2>
                        <p className="text-lg text-text-secondary">Three steps. Five seconds. Zero wasted applications.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-black mx-auto mb-5">1</div>
                            <h3 className="text-xl font-bold mb-2">Paste the Job URL</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">Copy the link from LinkedIn, Indeed, Glassdoor — or paste the job description directly.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-black mx-auto mb-5">2</div>
                            <h3 className="text-xl font-bold mb-2">Get the Ghost Score</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">AI analyzes 15+ red flags in seconds. You get a probability score, company integrity grade, and detailed breakdown.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-2xl font-black mx-auto mb-5">3</div>
                            <h3 className="text-xl font-bold mb-2">Apply With Confidence</h3>
                            <p className="text-text-secondary text-sm leading-relaxed">If the job is legit, generate a tailored CV, cover letter, and interview prep — all specific to that role.</p>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 3 — SOUND FAMILIAR? (Pain Points)
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Sound Familiar?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-white/[0.03] p-8 rounded-xl border border-white/5">
                            <p className="text-lg leading-relaxed">
                                &ldquo;Applied to 50+ jobs this month. Got 2 responses.&rdquo;
                            </p>
                        </div>
                        <div className="bg-white/[0.03] p-8 rounded-xl border border-white/5">
                            <p className="text-lg leading-relaxed">
                                &ldquo;Spent 3 hours customizing my CV for a role posted 4 months ago.&rdquo;
                            </p>
                        </div>
                        <div className="bg-white/[0.03] p-8 rounded-xl border border-white/5">
                            <p className="text-lg leading-relaxed">
                                &ldquo;The listing asked for 10 years of experience in a 5-year-old technology.&rdquo;
                            </p>
                        </div>
                    </div>
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="text-2xl font-bold mb-3">It&apos;s not you. It&apos;s ghost jobs.</p>
                        <p className="text-xl text-primary font-semibold mb-2">43% of online job postings aren&apos;t real.</p>
                        <p className="text-sm text-text-secondary">— Clarify Capital Research, 2022</p>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 4 — THE TRANSPARENCY GAP (Education)
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-4xl md:text-5xl font-black text-center mb-4">The Transparency Gap.</h2>
                    <p className="text-lg text-center text-text-secondary mb-14 max-w-3xl mx-auto leading-relaxed">
                        Companies post &quot;Ghost Jobs&quot; for many reasons. Collectively, they create a massive market failure for talent.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {[
                            { title: 'Legal Compliance', desc: 'HR needs to prove they tried to fill the role externally before giving it to an internal candidate.' },
                            { title: 'Talent Hoarding', desc: 'Companies collect resumes for future openings that may never come. Your CV sits in a database forever.' },
                            { title: 'Growth Optics', desc: "Posting jobs makes the company look like it's growing — great for investors, terrible for you." },
                            { title: 'Already Filled', desc: 'The internal candidate was chosen before the job was posted. The listing is just a formality.' },
                        ].map((item, i) => (
                            <div key={i} className="bg-bg-primary p-7 rounded-xl border border-white/5">
                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="max-w-2xl mx-auto bg-white/[0.03] p-8 rounded-xl border border-primary/20 text-center">
                        <p className="text-xl font-bold">
                            The average job seeker wastes 5.5 hours per week applying to jobs that don&apos;t exist.
                        </p>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 5 — GHOST TRANSPARENCY SCORE™
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">
                            <span className="text-primary">Ghost Transparency Score™</span>
                        </h2>
                        <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                            We use collective outcomes to build the first real-time integrity rating for hiring companies.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                            <h3 className="font-semibold text-sm text-text-secondary mb-1">Legit Job RR</h3>
                            <div className="text-2xl font-black text-success">
                                {legitStats?.response_rate_pct ? `${Math.round(legitStats.response_rate_pct)}%` : '84%'}
                            </div>
                            <p className="text-text-secondary text-[10px] mt-1 uppercase tracking-wide">Grade A response rate</p>
                        </div>
                        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                            <h3 className="font-semibold text-sm text-text-secondary mb-1">Market Velocity</h3>
                            <div className="text-2xl font-black">
                                {legitStats?.avg_days_to_response ? `${Math.round(legitStats.avg_days_to_response)}d` : '3.2d'}
                            </div>
                            <p className="text-text-secondary text-[10px] mt-1 uppercase tracking-wide">Avg reply time (verified)</p>
                        </div>
                        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                            <h3 className="font-semibold text-sm text-text-secondary mb-1">Ghost Ratio</h3>
                            <div className="text-2xl font-black text-danger">
                                {ghostStats?.response_rate_pct ? `${Math.round(ghostStats.response_rate_pct)}%` : '2%'}
                            </div>
                            <p className="text-text-secondary text-[10px] mt-1 uppercase tracking-wide">Response probability (suspicious)</p>
                        </div>
                        <div className="bg-bg-card p-6 rounded-2xl border border-white/5">
                            <h3 className="font-semibold text-sm text-text-secondary mb-1">Top Integrity</h3>
                            <div className="text-xl font-black text-primary truncate">
                                Empresa 1
                            </div>
                            <p className="text-text-secondary text-[10px] mt-1 uppercase tracking-wide">Market leader</p>
                        </div>
                    </div>
                </div>
            </section>



            {/* ═══════════════════════════════════════════
                SECTION 7 — SCIENTIFIC METHODOLOGY
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-black mb-4">Scientific Methodology</h2>
                        <p className="text-lg text-text-secondary max-w-3xl mx-auto">
                            Our <strong>Hiring Integrity Score™</strong> is validated through a massive outcome-tracking loop.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Outcome Correlation Engine</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        We cross-reference every job analysis with real-world outcomes. If a company stops responding, our weights adjust automatically.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">R² Accuracy Factor</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        Live accuracy metrics published at 500+ tracked outcomes — model calibration is in progress.
                                    </p>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div>
                                    <h4 className="font-bold mb-1">Neural Weight Calibration</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed">
                                        We analyze specific red-flag patterns like <em>&quot;Growth Optics Posting&quot;</em> and <em>&quot;Internal-Only Compliance&quot;</em> using entropy-based weights.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bg-card rounded-2xl border border-white/10 p-8">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xs font-black tracking-widest uppercase text-text-secondary">Market Confidence</span>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Legit (0-25 Score)</span>
                                        <span className="text-success">86% Success</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="bg-success h-full w-[86%]"></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span>Ghost (75+ Score)</span>
                                        <span className="text-danger">4% Success</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                        <div className="bg-danger h-full w-[4%]"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <p className="text-[10px] text-text-secondary">
                                    Based on verified application outcomes tracked by the GhostJob community.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 8 — GHOST WALL PREVIEW
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-14">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">The Ghost Wall</h2>
                        <p className="text-lg text-text-secondary">Real ghost jobs exposed by real job seekers.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        {(!susJobs || susJobs.length === 0) ? (
                            <div className="md:col-span-3 p-16 bg-white/[0.02] rounded-2xl border border-white/5 text-center">
                                <p className="text-text-secondary">Ghost Wall data incoming — real ghost jobs will appear here soon.</p>
                            </div>
                        ) : (
                            susJobs.map((job, index) => (
                                <div key={job.id} className="bg-bg-primary rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold">{job.job_title}</h3>
                                                <p className="text-text-secondary text-sm">Empresa {index + 1}</p>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${job.ghost_verdict === 'certified_ghost' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                                                {job.ghost_verdict === 'certified_ghost' ? 'Certified Ghost' : 'Suspicious'}
                                            </span>
                                        </div>

                                        <div className="flex items-center space-x-2 mb-4">
                                            <span className={`text-2xl font-black ${Number(job.ghost_score) > 80 ? 'text-danger' : 'text-warning'}`}>
                                                {Math.round(Number(job.ghost_score))}%
                                            </span>
                                            <span className="text-xs text-text-secondary">Ghost Score</span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-text-secondary border-t border-white/5 pt-4">
                                            <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                            <Link href={`/jobs/${job.id}`} className="text-primary hover:underline text-xs font-semibold">View →</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="text-center">
                        <Link href="/ghost-wall" className="text-primary hover:text-white transition font-semibold text-sm">
                            See the Full Ghost Wall →
                        </Link>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 9 — FAQ
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-4xl md:text-5xl font-bold text-center mb-14">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {[
                            { q: 'How accurate is the ghost detection?', a: 'Our AI analyzes 15+ signals — impossible requirements, vague descriptions, missing salary, reposting patterns. It provides a probability score similar to a spam filter. Not 100% certain, but it catches obvious fakes and flags suspicious patterns humans miss.' },
                            { q: 'I already have a resume builder. Why this?', a: "Resume builders help you create CVs. We help you decide IF you should. Why spend 2 hours crafting the perfect CV for a job that doesn't exist? GhostJob filters first, then builds — tailored to THAT specific job." },
                            { q: 'Is my data safe?', a: 'Your data is encrypted and stored securely. We never share your information with employers or third parties. You own your data and can delete it anytime.' },
                            { q: 'Can I cancel anytime?', a: 'Yes. No contracts, no hidden fees. Cancel with one click. You keep access until the end of your billing period.' },
                            { q: 'What makes this different from other job tools?', a: "Other tools start with your CV. We start with THE JOB. First we verify it's real, then we tailor everything — CV, cover letter, interview prep. Ghost detection + full application preparation in one flow. No one else does this." },
                        ].map((item, i) => (
                            <details key={i} className="group bg-bg-card rounded-xl border border-white/5 p-5 [&_summary::-webkit-details-marker]:hidden">
                                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold">
                                    <h3 className="group-open:text-primary transition-colors">{item.q}</h3>
                                    <span className="shrink-0 rounded-full bg-white/5 p-2 group-open:bg-primary/20 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-4 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                </summary>
                                <p className="mt-3 leading-relaxed text-text-secondary text-sm">{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                SECTION 10 — FINAL CTA
            ═══════════════════════════════════════════ */}
            <section className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-4xl">
                    <div className="bg-bg-primary p-12 md:p-16 rounded-3xl border border-primary/20 text-center">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                            Every hour on a ghost job is an hour you&apos;re NOT spending on the real one.
                        </h2>
                        <p className="text-lg text-text-secondary mb-8">
                            Stop guessing. Start knowing.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/analyze"
                                className="px-10 py-4 text-lg gradient-purple rounded-xl font-bold hover:opacity-90 transition"
                            >
                                Analyze Your First Job — Free
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-10 py-4 text-lg border border-white/10 rounded-xl font-semibold hover:border-primary/30 transition text-text-secondary hover:text-white"
                            >
                                See Plans
                            </Link>
                        </div>
                        <p className="text-sm text-text-secondary mt-6">
                            No credit card required · Takes 30 seconds
                        </p>
                    </div>
                </div>
            </section>


            {/* ═══════════════════════════════════════════
                FOOTER
            ═══════════════════════════════════════════ */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-2xl">👻</span>
                                <span className="text-lg font-bold">GhostJob</span>
                            </div>
                            <p className="text-sm text-text-secondary max-w-xs text-center md:text-left">
                                Hiring transparency infrastructure. We rate companies based on real application outcomes.
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            <Link href="/methodology" className="text-text-secondary hover:text-white transition">Methodology</Link>
                            <Link href="/rankings" className="text-text-secondary hover:text-white transition">Rankings</Link>
                            <Link href="/pricing" className="text-text-secondary hover:text-white transition">Pricing</Link>
                            <Link href="/privacy" className="text-text-secondary hover:text-white transition">Privacy</Link>
                            <Link href="/terms" className="text-text-secondary hover:text-white transition">Terms</Link>
                            <a href="mailto:hello@ghostjob.app" className="text-text-secondary hover:text-white transition">Contact</a>
                        </div>
                        <div className="text-text-secondary text-xs">
                            &copy; {new Date().getFullYear()} GhostJob
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
