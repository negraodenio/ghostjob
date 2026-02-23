import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function GhostWallPage() {
    const supabase = await createClient();

    // Fetch public ghost job analyses
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('is_public', true)
        .order('ghost_score', { ascending: false })
        .limit(20);

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <div className="flex space-x-4">
                        <Link href="/analyze" className="px-6 py-2 gradient-purple rounded-lg font-semibold hover:opacity-90 transition">
                            Analyze a Job
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-6xl font-black mb-4">
                        👻 Ghost Wall
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                        Public feed of the worst ghost jobs detected by our AI. See what jobs others have flagged as fake.
                    </p>
                </div>

                {/* Ghost Wall Feed */}
                <div className="space-y-6">
                    {!applications || applications.length === 0 ? (
                        <div className="text-center py-20 bg-bg-card rounded-xl border border-gray-800">
                            <div className="text-8xl mb-4 ghost-float">👻</div>
                            <h3 className="text-2xl font-bold mb-2">No public ghost jobs yet</h3>
                            <p className="text-text-secondary mb-6">Be the first to expose a ghost job!</p>
                            <Link
                                href="/analyze"
                                className="inline-block px-8 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Analyze a Job
                            </Link>
                        </div>
                    ) : (
                        applications.map((app, i) => (
                            <Link
                                key={app.id}
                                href={`/ghost/${app.id}`}
                                className="block bg-bg-card p-8 rounded-xl border border-gray-800 hover:border-danger transition group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="text-5xl">
                                                {app.ghost_score > 85 ? '💀' : '👻'}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold group-hover:text-danger transition">
                                                    Empresa {i + 1}
                                                </h3>
                                                <p className="text-text-secondary">{app.job_title || 'Unknown Position'}</p>
                                            </div>
                                        </div>

                                        {app.ghost_headline && (
                                            <h4 className="text-xl font-semibold text-primary mb-2">
                                                {app.ghost_headline}
                                            </h4>
                                        )}

                                        {app.red_flags && app.red_flags.length > 0 && (
                                            <div className="text-text-secondary mb-2">
                                                🚩 Top red flag: <span className="text-text-primary font-semibold">
                                                    {app.red_flags[0].title}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        <div className="text-5xl font-black text-danger mb-2 font-mono">
                                            {app.ghost_score}
                                        </div>
                                        <div className="text-sm text-text-secondary uppercase tracking-wide">
                                            Ghost Score
                                        </div>
                                        <div className="mt-4 flex items-center space-x-2 text-text-secondary">
                                            <span>🔥</span>
                                            <span>{app.upvotes || 0} upvotes</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                                    <div className="text-sm text-text-secondary">
                                        Posted {new Date(app.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-primary group-hover:underline">
                                        View Full Analysis →
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
