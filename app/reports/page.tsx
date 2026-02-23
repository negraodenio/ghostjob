import { createClient } from "@/lib/supabase/server";
import LegalDisclaimer from "@/components/LegalDisclaimer";
import Link from "next/link";

export default async function ReportsPage() {
    const supabase = await createClient();

    // Fetch Sector-level Analytics
    const { data: sectors } = await supabase
        .from('view_industry_transparency_reports')
        .select('*');

    // Fetch Anonymized Leaderboard
    const { data: leaderboard } = await supabase
        .from('view_anonymized_rankings')
        .select('*')
        .limit(10);

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary pt-32 pb-24">
            <div className="container mx-auto px-6">
                <header className="mb-16 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                        The State of Hiring Transparency
                    </h1>
                    <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                        Empirical data on corporate honesty across major industries.
                        Tracking market signals to build a fairer hiring ecosystem.
                    </p>
                </header>

                {/* Market Pulse - Sector Grid */}
                <section className="mb-24">
                    <h2 className="text-2xl font-bold mb-8 border-l-4 border-primary pl-4">
                        Market Pulse by Sector
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(!sectors || sectors.length === 0) ? (
                            <div className="col-span-full p-20 text-center bg-bg-card border border-dashed border-white/10 rounded-3xl">
                                <div className="text-4xl mb-4">🔬</div>
                                <h3 className="text-xl font-bold mb-2">Analyzing Market Data...</h3>
                                <p className="text-text-secondary">We are currently processing the latest hiring integrity signals. Check back in a few minutes.</p>
                                <p className="text-[10px] text-primary/50 mt-4 uppercase font-bold">Scientific Engine Calibration in Progress</p>
                            </div>
                        ) : sectors.map((sector: any) => (
                            <div key={sector.sector_name} className="p-6 rounded-2xl bg-bg-card border border-white/5 hover:border-primary/30 transition group">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold">{sector.sector_name}</h3>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sector.sector_status === 'High Transparency' ? 'bg-success/20 text-success' :
                                        sector.sector_status === 'Mixed Integrity' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                                        }`}>
                                        {sector.sector_status}
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-secondary">Integrity Index</span>
                                        <span className="font-mono text-primary font-bold">{sector.sector_integrity_index}/100</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${sector.sector_integrity_index}%` }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <div className="text-[10px] uppercase text-text-secondary mb-1">Ghost Ratio</div>
                                            <div className="font-bold text-danger">{sector.sector_ghost_ratio}%</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase text-text-secondary mb-1">Response Rate</div>
                                            <div className="font-bold text-success">{sector.sector_response_rate}%</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Anonymized Leaderboard */}
                <section className="mb-24">
                    <div className="bg-bg-card border border-white/5 rounded-3xl overflow-hidden">
                        <div className="p-8 border-b border-white/5">
                            <h2 className="text-2xl font-bold">Transparency Leaders (Anonymized)</h2>
                            <p className="text-sm text-text-secondary mt-2">
                                Real company scores, names withheld for verification.
                                Verified companies can claim their profiles to reveal their identity.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-text-secondary text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-8 py-4">Ranking</th>
                                        <th className="px-8 py-4">Industry</th>
                                        <th className="px-8 py-4">Integrity Grade</th>
                                        <th className="px-8 py-4">Score</th>
                                        <th className="px-8 py-4">Data Points</th>
                                        <th className="px-8 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {(!leaderboard || leaderboard.length === 0) ? (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-text-secondary italic">
                                                Leaderboard data is currently being verified.
                                            </td>
                                        </tr>
                                    ) : leaderboard.map((rank: any, i: number) => (
                                        <tr key={rank.anonymized_name} className="hover:bg-white/[0.02] transition">
                                            <td className="px-8 py-6 font-bold text-lg">#{i + 1}</td>
                                            <td className="px-8 py-6 text-text-secondary">{rank.sector}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full font-bold text-sm ${rank.grade === 'A' || rank.grade === 'B' ? 'bg-success/20 text-success' :
                                                    rank.grade === 'C' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'
                                                    }`}>
                                                    Grade {rank.grade}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 font-mono font-bold text-primary">{rank.score}</td>
                                            <td className="px-8 py-6 text-sm text-text-secondary">{rank.data_points} outcomes</td>
                                            <td className="px-8 py-6">
                                                <button className="text-xs font-bold text-text-secondary hover:text-text-primary underline">
                                                    Is this your company? Claim →
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* Final Disclaimer */}
                <div className="max-w-4xl mx-auto border-t border-white/5 pt-12">
                    <LegalDisclaimer />
                    <div className="mt-8 text-center">
                        <Link href="/methodology" className="text-sm text-text-secondary hover:text-primary transition underline decoration-dotted underline-offset-4">
                            Learn about our statistical methodology and $R^2$ accuracy →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
