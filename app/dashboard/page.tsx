import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import SubscriptionStatus from '@/components/SubscriptionStatus';
import OutcomeTracker from '@/components/OutcomeTracker';

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

    // Outcome Intelligence Stats — The core of the data flywheel
    const trackedApps = applications?.filter(app => app.outcome_status && app.outcome_status !== 'pending') || [];
    const responsesReceived = applications?.filter(app => app.received_response === true).length || 0;
    const interviewsReached = applications?.filter(app => app.reached_interview === true).length || 0;
    const offersReceived = applications?.filter(app => app.received_offer === true).length || 0;
    const responseRate = trackedApps.length > 0
        ? Math.round((responsesReceived / trackedApps.length) * 100)
        : null;

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
                        <Link href="/profile" className="text-text-secondary hover:text-white transition">
                            Profile
                        </Link>
                        <div className="text-text-secondary">{user.email}</div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">My Applications</h1>
                    <p className="text-text-secondary">
                        {trackedApps.length > 0
                            ? `${trackedApps.length} tracked • ${responseRate ?? '—'}% response rate`
                            : 'Track outcomes to unlock AI accuracy improvements'}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                    <div className="bg-bg-card p-5 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Analyses</div>
                        <div className="text-3xl font-bold text-primary">{totalAnalyses}</div>
                    </div>
                    <div className="bg-bg-card p-5 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Avg Score</div>
                        <div className="text-3xl font-bold">{avgGhostScore}</div>
                    </div>
                    <div className="bg-bg-card p-5 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Ghost Jobs</div>
                        <div className="text-3xl font-bold text-danger">{ghostJobs} 👻</div>
                    </div>
                    <div className="bg-bg-card p-5 rounded-xl border border-gray-800">
                        <div className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Legit</div>
                        <div className="text-3xl font-bold text-success">{legitJobs} ✅</div>
                    </div>
                    <div className="bg-bg-card p-5 rounded-xl border border-gray-800 col-span-2 md:col-span-1">
                        <div className="text-text-secondary text-xs mb-2 uppercase tracking-wide">Response Rate</div>
                        <div className="text-3xl font-bold text-cyan-400">
                            {responseRate !== null ? `${responseRate}%` : '—'}
                        </div>
                        <div className="text-[10px] text-text-secondary mt-1">
                            {interviewsReached > 0 ? `${interviewsReached} interviews` : 'Track to see'}
                            {offersReceived > 0 ? ` • ${offersReceived} offers 🎉` : ''}
                        </div>
                    </div>
                </div>

                {/* Subscription Status */}
                <SubscriptionStatus
                    plan={profile?.plan || 'free'}
                    analysesCount={profile?.analyses_count || 0}
                />

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
                                <div
                                    key={app.id}
                                    className="bg-bg-card p-6 rounded-xl border border-gray-800 hover:border-white/20 transition group flex flex-col justify-between"
                                >
                                    <Link href={`/analyze/${app.id}`} className="flex-1">
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

                                    <OutcomeTracker
                                        applicationId={app.id}
                                        initialStatus={app.outcome_status}
                                        ghostScore={app.ghost_score}
                                        compact={true}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
