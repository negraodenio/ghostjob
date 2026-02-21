'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import html2canvas from 'html2canvas';

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

interface Application {
    id: string;
    company_name: string;
    job_title: string;
    ghost_score: number;
    ghost_verdict: string;
    ghost_headline: string | null;
    ghost_roast: string | null;
    red_flags: RedFlag[];
    green_flags: GreenFlag[];
    job_quality: JobQuality;
    ghost_advice: string;
    created_at: string;
}

export default function AnalysisResultPage() {
    const params = useParams();

    const [application, setApplication] = useState<Application | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSharing, setIsSharing] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [activeTab, setActiveTab] = useState<'red' | 'green' | 'quality'>('red');
    const reportRef = useRef<HTMLDivElement>(null);

    const handleShare = async () => {
        if (!reportRef.current) return;
        setIsSharing(true);
        try {
            const canvas = await html2canvas(reportRef.current, { backgroundColor: '#0A0A0A', scale: 2 });
            const dataUrl = canvas.toDataURL('image/png');

            const link = document.createElement('a');
            link.download = `GhostJob-${application?.company_name || 'Report'}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to generate image', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handlePublish = async () => {
        if (!application) return;
        setIsPublishing(true);
        try {
            const res = await fetch(`/api/applications/${application.id}/publish`, { method: 'POST' });
            if (res.ok) {
                alert('Published to Ghost Wall successfully! Thousands of job seekers can now see it.');
            } else {
                alert('Failed to publish. Ensure you are logged in.');
            }
        } catch (error) {
            console.error('Failed to publish', error);
        } finally {
            setIsPublishing(false);
        }
    };

    useEffect(() => {
        const fetchAnalysis = async () => {
            try {
                const response = await fetch(`/api/applications/${params.id}`);
                if (!response.ok) throw new Error('Failed to load analysis');
                const data = await response.json();
                setApplication(data);
            } catch (error) {
                console.error('Error loading analysis:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) {
            fetchAnalysis();
        }
    }, [params.id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl ghost-float mb-4">👻</div>
                    <div className="text-text-secondary">Loading analysis...</div>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😢</div>
                    <h1 className="text-2xl font-bold mb-2">Analysis Not Found</h1>
                    <Link href="/analyze" className="text-primary hover:underline">
                        Start a new analysis →
                    </Link>
                </div>
            </div>
        );
    }

    const isGhost = application.ghost_score > 60;
    const scoreColor =
        application.ghost_score >= 86 ? 'text-danger'
            : application.ghost_score >= 61 ? 'text-warning'
                : application.ghost_score >= 31 ? 'text-warning'
                    : 'text-success';

    const borderColor =
        application.ghost_score >= 86 ? 'border-danger'
            : application.ghost_score >= 61 ? 'border-warning'
                : application.ghost_score >= 31 ? 'border-warning'
                    : 'border-success';

    const bgGradient =
        application.ghost_score >= 86 ? 'from-danger/10 to-bg-card'
            : application.ghost_score >= 61 ? 'from-warning/10 to-bg-card'
                : 'from-success/10 to-bg-card';

    const verdictEmoji =
        application.ghost_verdict === 'certified_ghost' ? '💀'
            : application.ghost_verdict === 'ghost' ? '👻'
                : application.ghost_verdict === 'sus' ? '🤔'
                    : '✅';

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <div className="flex space-x-4">
                        <Link href="/analyze" className="px-6 py-2 gradient-purple rounded-lg font-semibold hover:opacity-90 transition text-sm">
                            New Check
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-12 max-w-5xl">
                {/* HERO SECTION */}
                <div ref={reportRef} className={`text-center mb-16 p-8 md:p-12 rounded-3xl border-2 ${borderColor} bg-gradient-to-br ${bgGradient} relative overflow-hidden`} style={{ backgroundColor: '#0A0A0A' }}>
                    {/* Background Noise */}
                    <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                    <div className="relative z-10">
                        {/* Company & Title */}
                        <div className="mb-8">
                            <h1 className="text-2xl md:text-3xl font-bold mb-2">{application.job_title}</h1>
                            <div className="text-xl text-text-secondary flex items-center justify-center gap-2">
                                <span className="text-2xl">🏢</span> {application.company_name}
                            </div>
                        </div>

                        {/* Ghost Score Meter */}
                        <div className="mb-8 relative inline-block">
                            <div className="text-9xl font-black mb-2 tracking-tighter flex items-center justify-center gap-4">
                                <span>{verdictEmoji}</span>
                                <span className={scoreColor}>{application.ghost_score}</span>
                            </div>
                            <div className="text-lg text-text-secondary uppercase tracking-widest font-bold">
                                Ghost Score
                                <Link
                                    href="/methodology"
                                    className="ml-2 text-sm text-gray-400 cursor-pointer hover:text-white inline-flex items-center"
                                    title="How is this calculated?"
                                >
                                    ℹ️
                                </Link>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-64 h-3 bg-gray-800 rounded-full mx-auto mt-6 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ease-out ${application.ghost_score >= 61 ? 'bg-danger' :
                                        application.ghost_score >= 31 ? 'bg-warning' : 'bg-success'
                                        }`}
                                    style={{ width: `${application.ghost_score}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Verdict Headline */}
                        <h2 className={`text-3xl md:text-5xl font-black mb-6 ${scoreColor}`}>
                            {application.ghost_headline || (isGhost ? "This looks like a ghost job." : "This job looks legit!")}
                        </h2>

                        {/* Roast/Hype */}
                        {application.ghost_roast && (
                            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto mb-8 italic">
                                &quot;{application.ghost_roast}&quot;
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col items-center gap-4 mt-8" data-html2canvas-ignore>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button
                                    onClick={handleShare}
                                    disabled={isSharing}
                                    className="px-8 py-3 bg-bg-card/80 border border-gray-700 rounded-xl font-semibold hover:border-primary transition flex items-center gap-2 backdrop-blur-sm"
                                >
                                    {isSharing ? '⏳ Generating Card...' : '🔗 Download Share Card'}
                                </button>
                                {isGhost && (
                                    <button
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                        className="px-8 py-3 bg-red-900/30 border border-red-500/50 text-red-400 rounded-xl font-semibold hover:bg-red-900/50 transition flex items-center gap-2 backdrop-blur-sm"
                                    >
                                        {isPublishing ? '⏳ Publishing...' : '💀 Report to Ghost Wall'}
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-6 mt-2">
                                <a
                                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just caught a Ghost Job with a ${application.ghost_score}% score using GhostJob! Stop wasting time building CVs for fake jobs. 👻 \n\nCheck yours at:`)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-text-secondary hover:text-white transition font-semibold text-sm"
                                >
                                    🐦 Share on X (Earn +1 Check)
                                </a>
                                <a
                                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ghostjob.app')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-text-secondary hover:text-white transition font-semibold text-sm"
                                >
                                    💼 Share on LinkedIn (Earn +1 Check)
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-bg-card rounded-xl border border-gray-800 overflow-hidden mb-12">
                    {/* Tab Headers */}
                    <div className="flex border-b border-gray-800 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('red')}
                            className={`flex-1 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'red'
                                ? 'bg-bg-primary text-danger border-b-2 border-danger'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            🚩 Red Flags ({application.red_flags.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('green')}
                            className={`flex-1 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'green'
                                ? 'bg-bg-primary text-success border-b-2 border-success'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            ✅ Green Flags ({application.green_flags.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('quality')}
                            className={`flex-1 px-6 py-4 font-semibold transition whitespace-nowrap ${activeTab === 'quality'
                                ? 'bg-bg-primary text-primary border-b-2 border-primary'
                                : 'text-text-secondary hover:text-text-primary'
                                }`}
                        >
                            📊 Job Quality
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'red' && (
                            <div className="space-y-4">
                                {application.red_flags.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🎉</div>
                                        <p className="text-xl text-text-primary mb-2">No Red Flags Detected!</p>
                                        <p className="text-text-secondary">This job posting looks remarkably clean.</p>
                                    </div>
                                ) : (
                                    application.red_flags.map((flag, index) => (
                                        <div
                                            key={index}
                                            className="p-6 bg-bg-primary border-l-4 border-danger rounded-r-lg shadow-sm"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <h3 className="font-bold text-lg text-danger">🚩 {flag.title}</h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${flag.severity === 'high'
                                                        ? 'bg-danger/20 text-danger'
                                                        : flag.severity === 'medium'
                                                            ? 'bg-warning/20 text-warning'
                                                            : 'bg-text-secondary/20 text-text-secondary'
                                                        }`}
                                                >
                                                    {flag.severity}
                                                </span>
                                            </div>
                                            <p className="text-text-primary mb-3 text-lg">{flag.explanation}</p>
                                            {flag.why_it_matters && (
                                                <div className="text-sm text-text-secondary bg-bg-card p-3 rounded-lg border border-gray-800">
                                                    <strong className="text-danger">Why it matters:</strong> {flag.why_it_matters}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'green' && (
                            <div className="space-y-4">
                                {application.green_flags.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-6xl mb-4">🤷‍♂️</div>
                                        <p className="text-xl text-text-primary mb-2">No Green Flags Found</p>
                                        <p className="text-text-secondary">The job description is lacking positive signals.</p>
                                    </div>
                                ) : (
                                    application.green_flags.map((flag, index) => (
                                        <div
                                            key={index}
                                            className="p-6 bg-bg-primary border-l-4 border-success rounded-r-lg shadow-sm"
                                        >
                                            <h3 className="font-bold text-lg mb-2 text-success">✅ {flag.title}</h3>
                                            <p className="text-text-primary mb-3 text-lg">{flag.explanation}</p>
                                            {flag.why_good && (
                                                <div className="text-sm text-text-secondary bg-bg-card p-3 rounded-lg border border-gray-800">
                                                    <strong className="text-success">Why it&apos;s good:</strong> {flag.why_good}
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'quality' && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-lg">Job Clarity</span>
                                        <span className="font-mono font-bold text-lg">{application.job_quality.clarity}/100</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all"
                                            style={{ width: `${application.job_quality.clarity}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-text-secondary mt-2">How well-defined are the roles and responsibilities?</p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-lg">Realism</span>
                                        <span className="font-mono font-bold text-lg">{application.job_quality.realism}/100</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 transition-all"
                                            style={{ width: `${application.job_quality.realism}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-text-secondary mt-2">Are the requirements realistic and achievable?</p>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-lg">Transparency</span>
                                        <span className="font-mono font-bold text-lg">{application.job_quality.transparency}/100</span>
                                    </div>
                                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-teal-500 transition-all"
                                            style={{ width: `${application.job_quality.transparency}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-text-secondary mt-2">Is compensation and company info transparent?</p>
                                </div>

                                <div className="pt-6 border-t border-gray-800">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold text-xl">Overall Quality Score</span>
                                        <span className="font-mono font-bold text-2xl text-primary">
                                            {application.job_quality.overall}/100
                                        </span>
                                    </div>
                                    <div className="h-6 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full gradient-purple transition-all"
                                            style={{ width: `${application.job_quality.overall}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-text-secondary mt-4 text-center">
                                        How are these scores calculated? <Link href="/methodology" className="text-primary hover:underline">Read our methodology →</Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Final Actions */}
                <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold mb-8">
                        {isGhost ? "Still want to apply? Proceed with caution." : "Ready to apply? Let's make you stand out."}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Link
                            href={`/application/${application.id}/cv`}
                            className="p-6 bg-bg-card border border-gray-800 rounded-xl hover:border-primary transition text-left group hover:bg-bg-card/80"
                        >
                            <div className="text-4xl mb-4">📄</div>
                            <div className="text-xl font-bold mb-2 group-hover:text-primary transition">Tailored CV</div>
                            <div className="text-text-secondary text-sm">beat the ATS with a resume built for this specific job.</div>
                        </Link>

                        <Link
                            href={`/application/${application.id}/cover-letter`}
                            className="p-6 bg-bg-card border border-gray-800 rounded-xl hover:border-primary transition text-left group hover:bg-bg-card/80"
                        >
                            <div className="text-4xl mb-4">✉️</div>
                            <div className="text-xl font-bold mb-2 group-hover:text-primary transition">Cover Letter</div>
                            <div className="text-text-secondary text-sm">Persuasive letter highlighting why you&apos;re the perfect fit.</div>
                        </Link>

                        <Link
                            href={`/application/${application.id}/interview`}
                            className="p-6 bg-bg-card border border-gray-800 rounded-xl hover:border-primary transition text-left group hover:bg-bg-card/80"
                        >
                            <div className="text-4xl mb-4">🎤</div>
                            <div className="text-xl font-bold mb-2 group-hover:text-primary transition">Interview Prep</div>
                            <div className="text-text-secondary text-sm">AI-generated questions and coaching for this specific role.</div>
                        </Link>

                        <Link
                            href={`/application/${application.id}/full-kit`}
                            className="p-6 bg-gradient-to-br from-primary/10 to-bg-card border-2 border-primary/50 rounded-xl hover:from-primary/20 transition text-left group"
                        >
                            <div className="text-4xl mb-4">🚀</div>
                            <div className="text-xl font-bold mb-2 text-primary">Full Application Kit</div>
                            <div className="text-text-secondary text-sm">Get CV, Cover Letter, and Interview Prep in one click.</div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
