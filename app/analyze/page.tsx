'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnalyzePage() {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingStep, setLoadingStep] = useState(0);

    const loadingSteps = [
        '🔍 Reading job description...',
        '👻 Checking for ghost signals...',
        '📊 Calculating scores...',
        '✅ Analysis complete!',
    ];

    const handleAnalyze = async () => {
        if (jobDescription.length < 200 && !jobUrl) {
            setError('Please paste the job description OR provide a Job URL');
            return;
        }

        setError('');
        setIsLoading(true);
        setLoadingStep(0);

        // Simulate progress through loading steps
        const stepInterval = setInterval(() => {
            setLoadingStep((prev) => {
                if (prev < loadingSteps.length - 1) {
                    return prev + 1;
                }
                return prev;
            });
        }, 800);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    job_description: jobDescription,
                    job_url: jobUrl || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Analysis failed');
            }

            clearInterval(stepInterval);
            setLoadingStep(loadingSteps.length - 1);

            // Wait a moment to show the final step
            setTimeout(() => {
                router.push(`/analyze/${data.id}`);
            }, 500);
        } catch (err) {
            clearInterval(stepInterval);
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="text-8xl mb-8 ghost-float">👻</div>
                    <div className="space-y-3">
                        {loadingSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`text-lg transition-all duration-300 ${index <= loadingStep
                                    ? 'text-text-primary opacity-100'
                                    : 'text-text-secondary opacity-30'
                                    }`}
                            >
                                {index === loadingStep && '→ '}
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition">
                            Dashboard
                        </Link>
                        <Link href="/login" className="text-text-secondary hover:text-text-primary transition">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-20 max-w-4xl">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold mb-4">Analyze a Job Posting</h1>
                    <p className="text-xl text-text-secondary">
                        Paste the job description below and we&apos;ll detect if it&apos;s a ghost job
                    </p>
                </div>

                <div className="bg-bg-card p-8 rounded-xl border border-gray-800">
                    {/* Job Description */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2">
                            Job Description *
                        </label>
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job description here (minimum 200 characters)..."
                            className="w-full h-64 px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition resize-none"
                            maxLength={10000}
                        />
                        <div className="flex justify-between mt-2 text-sm text-text-secondary">
                            <span>{jobDescription.length} / 10,000 characters</span>
                            <span className={jobDescription.length >= 200 ? 'text-success' : 'text-warning'}>
                                {jobDescription.length >= 200 ? '✓ Minimum reached' : `Need ${200 - jobDescription.length} more characters`}
                            </span>
                        </div>
                    </div>

                    {/* Job URL (Optional) */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold mb-2">
                            Job URL (Optional)
                        </label>
                        <input
                            type="url"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            placeholder="https://example.com/jobs/123"
                            className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary transition"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger">
                            {error}
                        </div>
                    )}

                    {/* Analyze Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={jobDescription.length < 200 && !jobUrl}
                        className="w-full px-8 py-4 gradient-purple rounded-lg font-bold text-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                        <span>Analyze This Job 👻</span>
                    </button>

                    <p className="text-center text-sm text-text-secondary mt-4">
                        Free tier: 3 analyses per month • <Link href="/pricing" className="text-primary hover:underline">Upgrade for unlimited</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
