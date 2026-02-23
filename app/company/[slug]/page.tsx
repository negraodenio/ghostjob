'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import NotificationCenter from '@/components/NotificationCenter';

interface CompanyData {
    id: string;
    name: string;
    normalized_name: string;
    hiring_integrity_score: number;
    hiring_integrity_grade: string;
    overall_response_rate: number;
    avg_days_to_response: number;
    total_jobs_posted: number;
    ghost_job_rate: number;
    website_url?: string;
    logo_url?: string;
}

interface JobPosting {
    id: string;
    job_title: string;
    ghost_score: number;
    ghost_verdict: string;
    created_at: string;
}

export default function CompanyDashboard({ params }: { params: { slug: string } }) {
    const [company, setCompany] = useState<CompanyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    const [jobs, setJobs] = useState<JobPosting[]>([]);

    useEffect(() => {
        const fetchCompanyAndJobs = async () => {
            try {
                // Fetch Company
                const { data: companyData, error: companyError } = await supabase
                    .from('companies')
                    .select('*')
                    .eq('normalized_name', params.slug)
                    .single();

                if (!companyError && companyData) {
                    setCompany(companyData);

                    // Fetch Latest Jobs
                    const { data: jobsData, error: jobsError } = await supabase
                        .from('jobs')
                        .select('id, job_title, ghost_score, ghost_verdict, created_at')
                        .eq('company_id', companyData.id)
                        .order('created_at', { ascending: false })
                        .limit(10);

                    if (!jobsError && jobsData) {
                        setJobs(jobsData);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch company data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCompanyAndJobs();
    }, [params.slug, supabase]);

    if (isLoading) return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl animate-pulse mb-4">🏢</div>
                <div className="text-text-secondary">Retrieving market footprint...</div>
            </div>
        </div>
    );

    // Fallback for demonstration if no data yet
    const displayCompany = company || {
        name: params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace('-', ' '),
        hiring_integrity_score: 0,
        hiring_integrity_grade: 'U',
        overall_response_rate: 0,
        avg_days_to_response: 0,
        total_jobs_posted: 0,
        ghost_job_rate: 0
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            {/* Header */}
            <header className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <Link href="/" className="text-2xl">👻</Link>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-widest">Empresa</h1>
                            <p className="text-[10px] text-text-secondary font-bold">Reputation Dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <NotificationCenter />
                        <div className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-bold border border-success/30">
                            Verified Transparent
                        </div>
                        <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-semibold transition">
                            Claim Account
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-bg-card p-8 rounded-3xl border border-gray-800 flex flex-col justify-between">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Integrity Grade</span>
                        <div className="mt-4 flex items-baseline gap-2">
                            <span className="text-7xl font-black text-white">{displayCompany.hiring_integrity_grade}</span>
                            <span className="text-sm font-bold text-text-secondary">({displayCompany.hiring_integrity_score.toFixed(0)})</span>
                        </div>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-4 overflow-hidden">
                            <div
                                className={`h-full ${['A', 'B'].includes(displayCompany.hiring_integrity_grade) ? 'bg-success' : displayCompany.hiring_integrity_grade === 'C' ? 'bg-primary' : 'bg-danger'}`}
                                style={{ width: `${displayCompany.hiring_integrity_score}%` }}>
                            </div>
                        </div>
                    </div>

                    <div className="bg-bg-card p-8 rounded-3xl border border-gray-800 flex flex-col justify-between">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Response Rate</span>
                        <div className="mt-4">
                            <span className="text-6xl font-black text-success">{Math.round(displayCompany.overall_response_rate)}%</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-2">Market Avg: 12%</p>
                    </div>

                    <div className="bg-bg-card p-8 rounded-3xl border border-gray-800 flex flex-col justify-between">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Avg. Response Time</span>
                        <div className="mt-4">
                            <span className="text-4xl font-black text-white">{Math.round(displayCompany.avg_days_to_response)} days</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-2">Calculated from verified responses</p>
                    </div>

                    <div className="bg-bg-card p-8 rounded-3xl border border-gray-800 flex flex-col justify-between">
                        <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Ghost Job Rate</span>
                        <div className="mt-4">
                            <span className="text-4xl font-black text-danger">{Math.round(displayCompany.ghost_job_rate)}%</span>
                        </div>
                        <p className="text-[10px] text-text-secondary mt-2">Percentage of suspicious postings</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Activity Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold mb-6">Recent Analyze Activity</h2>
                        <div className="space-y-4">
                            {jobs.length === 0 ? (
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/5 text-center">
                                    <p className="text-text-secondary italic">No recent analyses found for this company.</p>
                                </div>
                            ) : (
                                jobs.map(job => (
                                    <div key={job.id} className="p-6 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/10 transition">
                                        <div>
                                            <h4 className="font-bold text-lg">{job.job_title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-text-secondary">{new Date(job.created_at).toLocaleDateString()}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${job.ghost_verdict === 'legit' ? 'bg-success/20 text-success' :
                                                    job.ghost_verdict === 'sus' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                                                    }`}>
                                                    {job.ghost_verdict}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-text-secondary mb-1">Ghost Score</div>
                                            <div className={`text-xl font-black ${job.ghost_score > 50 ? 'text-danger' : 'text-success'}`}>
                                                {job.ghost_score}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sidebar: B2B Actions */}
                    <div className="space-y-6">
                        <div className="gradient-purple p-8 rounded-3xl text-white shadow-2xl shadow-purple-500/20">
                            <h3 className="text-2xl font-black mb-4">Improve Your Score</h3>
                            <p className="text-sm opacity-90 mb-6 font-medium">
                                Transparent companies get 4x more qualified candidates. Build trust in your hiring process.
                            </p>
                            <button className="w-full py-4 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition shadow-lg">
                                Access B2B Dashboard
                            </button>
                        </div>

                        <div className="bg-bg-card p-6 rounded-3xl border border-gray-800">
                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                <span className="text-primary text-xl">⚠️</span> Protect Your Reputation
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed mb-6">
                                Claim your official company profile to verify response times and resolve community flags.
                            </p>
                            <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition">
                                Claim Profile
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
