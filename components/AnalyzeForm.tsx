'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyzeFormProps {
    className?: string;
}

export default function AnalyzeForm({ className = '' }: AnalyzeFormProps) {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [loadingStep, setLoadingStep] = useState(0);

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;

        // Auto-detect if user pasted a URL directly in the text area
        if (val.trim().startsWith('http') && !val.includes(' ') && val.length < 500) {
            setJobUrl(val.trim());
            setJobDescription('');
        } else {
            setJobDescription(val);
        }
    };

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

            // Handle non-JSON responses (like HTML error pages from Vercel)
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('[AnalyzeForm] Received non-JSON response:', text);

                if (response.status === 504) {
                    throw new Error('O servidor demorou muito para responder (Timeout). Tente colar apenas a descrição da vaga em vez do link.');
                }
                throw new Error(`Erro do servidor (${response.status}). Tente novamente mais tarde.`);
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'A análise falhou. Tente novamente.');
            }

            clearInterval(stepInterval);
            setLoadingStep(loadingSteps.length - 1);

            // Wait a moment to show the final step
            setTimeout(() => {
                router.push(`/analyze/${data.id}`);
            }, 500);
        } catch (err) {
            clearInterval(stepInterval);
            console.error('[AnalyzeForm] Error:', err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado. Tente novamente.');
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`p-8 rounded-2xl bg-bg-card border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] ${className}`}>
                <div className="text-center py-10">
                    <div className="text-6xl mb-8 ghost-float inline-block">👻</div>
                    <div className="space-y-4 max-w-xs mx-auto text-left">
                        {loadingSteps.map((step, index) => (
                            <div
                                key={index}
                                className={`text-lg flex items-center gap-3 transition-all duration-300 ${index <= loadingStep
                                    ? 'text-text-primary opacity-100'
                                    : 'text-text-secondary opacity-30'
                                    }`}
                            >
                                <span className={`w-2 h-2 rounded-full ${index === loadingStep ? 'bg-primary animate-pulse' : index < loadingStep ? 'bg-success' : 'bg-gray-700'}`}></span>
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`p-8 rounded-2xl bg-bg-card border border-primary/30 shadow-[0_0_30px_rgba(139,92,246,0.15)] ${className}`}>
            {/* Job Description */}
            <div className="mb-6">
                <label className="block text-sm font-bold mb-2 text-text-primary">
                    Job Description *
                </label>
                <textarea
                    value={jobDescription}
                    onChange={handleDescriptionChange}
                    placeholder="Paste the full job description here (minimum 200 characters)..."
                    className="w-full h-48 px-4 py-3 bg-bg-primary/50 border border-gray-800 rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary/50 transition resize-none"
                    maxLength={10000}
                />
                <div className="flex justify-between mt-2 text-xs">
                    <span className="text-text-secondary">{jobDescription.length.toLocaleString()} / 10,000 characters</span>
                    <span className={jobDescription.length >= 200 || jobUrl.length > 0 ? 'text-success' : 'text-warning font-medium'}>
                        {jobDescription.length >= 200 || jobUrl.length > 0 ? '✓ Ready to analyze' : `Need ${200 - jobDescription.length} more characters`}
                    </span>
                </div>
            </div>

            {/* Job URL (Optional) */}
            <div className="mb-8">
                <label className="block text-sm font-bold mb-2 text-text-primary">
                    Or Job URL (Optional)
                </label>
                <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/view/..."
                    className="w-full px-4 py-3 bg-bg-primary/50 border border-gray-800 rounded-xl text-text-primary placeholder-text-secondary focus:outline-none focus:border-primary/50 transition text-sm"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm flex items-start gap-3">
                    <span className="mt-0.5">⚠️</span>
                    {error}
                </div>
            )}

            {/* Analyze Button */}
            <button
                onClick={handleAnalyze}
                disabled={jobDescription.length < 200 && !jobUrl}
                className="w-full px-8 py-4 gradient-purple rounded-xl font-black text-xl hover:opacity-90 transition transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
            >
                <span className="text-2xl">👻</span>
                <span>Analyze this Job — FREE</span>
            </button>

            <p className="text-center text-xs text-text-secondary mt-6">
                Free tier: 3 analyses/month • No signup required
            </p>
        </div>
    );
}
