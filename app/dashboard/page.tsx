import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardPage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    // Fetch user's applications
    const { data: applications } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    const totalAnalyses = applications?.length || 0;
    const avgGhostScore = applications && applications.length > 0
        ? Math.round(applications.reduce((acc, app) => acc + (app.ghost_score || 0), 0) / applications.length)
        : 0;

    const ghostJobs = applications?.filter(app => app.ghost_score > 60).length || 0;
    const legitJobs = applications?.filter(app => app.ghost_score <= 60).length || 0;

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link href="/analyze" className="px-6 py-2 gradient-purple rounded-lg font-semibold hover:opacity-90 transition">
                            New Analysis
                        </Link>
                        <div className="text-text-secondary">{user.email}</div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
                    <p className="text-text-secondary">Track your job analyses and applications</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-bg-card p-6 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-sm mb-2">Total Analyses</div>
                        <div className="text-4xl font-bold text-primary">{totalAnalyses}</div>
                    </div>
                    <div className="bg-bg-card p-6 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-sm mb-2">Average Ghost Score</div>
                        <div className="text-4xl font-bold">{avgGhostScore}</div>
                    </div>
                    <div className="bg-bg-card p-6 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-sm mb-2">Ghost Jobs Found</div>
                        <div className="text-4xl font-bold text-danger">{ghostJobs} 👻</div>
                    </div>
                    <div className="bg-bg-card p-6 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-sm mb-2">Legit Opportunities</div>
                        <div className="text-4xl font-bold text-success">{legitJobs} ✅</div>
                    </div>
                </div>

                {/* Subscription Status */}
                <div className="bg-gradient-to-br from-primary/10 to-bg-card p-6 rounded-xl border border-primary mb-12">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">
                                {profile?.plan === 'free' ? '🆓 Free Plan' :
                                    profile?.plan === 'pro' ? '⭐ Pro Plan' :
                                        '💎 Premium Plan'}
                            </h3>
                            <p className="text-text-secondary">
                                {profile?.plan === 'free'
                                    ? `${(profile.analyses_count || 0)} / 3 analyses used this month`
                                    : 'Unlimited analyses'}
                            </p>
                        </div>
                        {profile?.plan === 'free' && (
                            <Link
                                href="/pricing"
                                className="px-8 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Upgrade to Pro
                            </Link>
                        )}
                    </div>
                </div>

                {/* Applications List */}
                <div>
                    <h2 className="text-3xl font-bold mb-6">Your Analyses</h2>

                    {!applications || applications.length === 0 ? (
                        <div className="text-center py-16 bg-bg-card rounded-xl border border-gray-800">
                            <div className="text-6xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold mb-2">No analyses yet</h3>
                            <p className="text-text-secondary mb-6">Start by analyzing your first job posting</p>
                            <Link
                                href="/analyze"
                                className="inline-block px-8 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition"
                            >
                                Analyze a Job 👻
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {applications.map((app) => (
                                <Link
                                    key={app.id}
                                    href={`/analyze/${app.id}`}
                                    className="bg-bg-card p-6 rounded-xl border border-gray-800 hover:border-primary transition group"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition">
                                                {app.company_name || 'Unknown Company'}
                                            </h3>
                                            <p className="text-text-secondary text-sm">{app.job_title || 'Unknown Position'}</p>
                                        </div>
                                        <div className="text-3xl">
                                            {app.ghost_score > 85 ? '💀' :
                                                app.ghost_score > 60 ? '👻' :
                                                    app.ghost_score > 30 ? '🤔' : '✅'}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-text-secondary mb-1">Ghost Score</div>
                                            <div className={`text-2xl font-bold font-mono ${app.ghost_score >= 61 ? 'text-danger' :
                                                    app.ghost_score >= 31 ? 'text-warning' :
                                                        'text-success'
                                                }`}>
                                                {app.ghost_score}/100
                                            </div>
                                        </div>
                                        <div className="text-sm text-text-secondary">
                                            {new Date(app.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
