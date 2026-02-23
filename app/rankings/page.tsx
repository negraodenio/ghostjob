'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Company {
    id: string;
    name: string;
    normalized_name: string;
    hiring_integrity_score: number;
    hiring_integrity_grade: string;
    overall_response_rate: number;
    avg_days_to_response: number;
    total_jobs_posted: number;
    total_reports: number;
}

export default function RankingsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const { data, error } = await supabase
                    .from('view_company_leaderboard')
                    .select('*')
                    .limit(50);

                if (!error && data) {
                    setCompanies(data);
                }
            } catch (err) {
                console.error('Failed to fetch rankings:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRankings();
    }, []);

    const getStatus = (grade: string) => {
        if (grade === 'A' || grade === 'B') return { label: 'Transparent', class: 'bg-success/20 text-success border-success/30' };
        if (grade === 'C') return { label: 'Good', class: 'bg-primary/20 text-primary border-primary/30' };
        if (grade === 'D') return { label: 'Ghost', class: 'bg-warning/20 text-warning border-warning/30' };
        return { label: 'Phantom', class: 'bg-danger/20 text-danger border-danger/30' };
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">

            <main className="pt-32 pb-20 px-6 container mx-auto max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black mb-4 flex items-center justify-center gap-4">
                        Market Transparency Ranking <span className="text-2xl px-3 py-1 bg-white/5 rounded-xl border border-white/10">v1.2</span>
                    </h1>
                    <p className="text-xl text-text-secondary">
                        The real-time index of company hiring integrity. <br />
                        Powered by community-reported application outcomes.
                    </p>
                </div>

                <div className="bg-bg-card rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                    {isLoading ? (
                        <div className="p-20 text-center">
                            <div className="text-4xl animate-bounce mb-4">👻</div>
                            <div className="text-text-secondary">Scanning market signals...</div>
                        </div>
                    ) : companies.length === 0 ? (
                        <div className="p-20 text-center">
                            <h3 className="text-xl font-bold mb-2">No rankings available yet</h3>
                            <p className="text-text-secondary">Be the first to analyze and report a company!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-gray-800">
                                    <tr>
                                        <th className="px-8 py-6 text-sm font-bold uppercase tracking-wider">Company</th>
                                        <th className="px-6 py-6 text-sm font-bold uppercase tracking-wider">Integrity Grade</th>
                                        <th className="px-6 py-6 text-sm font-bold uppercase tracking-wider text-center">Response Rate</th>
                                        <th className="px-6 py-6 text-sm font-bold uppercase tracking-wider text-right">Reports</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {companies.map((company, idx) => {
                                        const status = getStatus(company.hiring_integrity_grade);
                                        return (
                                            <tr key={company.id} className="hover:bg-white/5 transition group">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-lg font-mono text-text-secondary w-6">#{idx + 1}</span>
                                                        <Link href={`/company/${company.normalized_name}`} className="font-bold text-lg group-hover:text-primary transition underline-offset-4 hover:underline">
                                                            {company.name}
                                                        </Link>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center space-x-3">
                                                        <span className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-xl border ${['A', 'B'].includes(company.hiring_integrity_grade) ? 'bg-success/20 text-success border-success/30' :
                                                            company.hiring_integrity_grade === 'C' ? 'bg-primary/20 text-primary border-primary/30' :
                                                                'bg-danger/20 text-danger border-danger/30'
                                                            }`}>
                                                            {company.hiring_integrity_grade}
                                                        </span>
                                                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden w-20">
                                                            <div
                                                                className={`h-full ${company.hiring_integrity_score > 70 ? 'bg-success' : company.hiring_integrity_score > 40 ? 'bg-warning' : 'bg-danger'}`}
                                                                style={{ width: `${company.hiring_integrity_score}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-center">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-white">
                                                            {company.overall_response_rate ? `${Math.round(company.overall_response_rate)}%` : '0%'}
                                                        </span>
                                                        <span className="text-[10px] text-text-secondary uppercase">avg {Math.round(company.avg_days_to_response || 0)} days</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <span className="font-mono text-text-secondary bg-white/5 px-3 py-1 rounded border border-white/5">
                                                        {company.total_reports}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center text-text-secondary text-sm italic max-w-2xl mx-auto">
                    ⚠️ Scores are based on algorithmic analysis of job descriptions and community-reported outcomes.
                    GhostJob acts as a platform for user feedback. <Link href="/legal" className="text-primary hover:underline">Read Legal Notice</Link>.
                </div>
            </main>
        </div>
    );
}
