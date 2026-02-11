'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserInfoForm from '@/components/UserInfoForm';

interface UserInfo {
    fullName: string;
    email: string;
    phone: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export default function FullKitPage() {
    const params = useParams();
    const id = params.id as string;

    // State
    const [isFormOpen, setIsFormOpen] = useState(true);
    const [progress, setProgress] = useState<{
        cv: 'pending' | 'loading' | 'done' | 'error',
        letter: 'pending' | 'loading' | 'done' | 'error',
        interview: 'pending' | 'loading' | 'done' | 'error'
    }>({
        cv: 'pending',
        letter: 'pending',
        interview: 'pending'
    });



    // Check for saved user info
    useEffect(() => {
        const saved = localStorage.getItem('ghostjob_user_info');
        if (saved) {
            // Optional: Auto-start or just pre-fill
            // For full kit, let's show form to confirm details first
        }
    }, []);

    const handleFormSubmit = async (userInfo: UserInfo) => {
        setIsFormOpen(false);
        generateAll(userInfo);
    };

    const generateAll = async (userInfo: UserInfo) => {
        // 1. Generate CV
        setProgress(prev => ({ ...prev, cv: 'loading' }));
        try {
            const res = await fetch('/api/generate-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId: id, userInfo })
            });
            if (!res.ok) throw new Error('CV Generation failed');
            await res.json();
            // cvResult = data.cv; (unused)

            setProgress(prev => ({ ...prev, cv: 'done' }));
        } catch (e) {
            console.error(e);
            setProgress(prev => ({ ...prev, cv: 'error' }));
        }

        // 2. Generate Cover Letter
        setProgress(prev => ({ ...prev, letter: 'loading' }));
        try {
            const res = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId: id, userInfo, tone: 'professional' }) // Default tone
            });
            if (!res.ok) throw new Error('Letter Generation failed');
            await res.json();

            setProgress(prev => ({ ...prev, letter: 'done' }));
        } catch (e) {
            console.error(e);
            setProgress(prev => ({ ...prev, letter: 'error' }));
        }

        // 3. Generate Interview Prep
        setProgress(prev => ({ ...prev, interview: 'loading' }));
        try {
            const res = await fetch('/api/generate-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId: id, difficulty: 'intermediate' }) // No userInfo needed now!
            });
            if (!res.ok) throw new Error('Interview Prep failed');
            await res.json();

            setProgress(prev => ({ ...prev, interview: 'done' }));
        } catch (e) {
            console.error(e);
            setProgress(prev => ({ ...prev, interview: 'error' }));
        }
    };

    // Helper to download simplistic text files for now (PDF generation logic is complex to duplicate here without components)
    // Or we link to the individual pages? The user wanted "Download PDF" buttons.
    // Re-implementing PDF generation here is redundant. 
    // Ideally, we'd have a PDF generator utility. 
    // For V1, let's link to the individual pages for the "View" action, and maybe a simple text download?
    // "Actually — for V1, Full Kit can just generate all 3 sequentially and show a page with links"
    // So "View" links are perfect.

    const isFinished = progress.cv !== 'pending' && progress.cv !== 'loading' &&
        progress.letter !== 'pending' && progress.letter !== 'loading' &&
        progress.interview !== 'pending' && progress.interview !== 'loading';

    if (isFormOpen) {
        return <UserInfoForm onSubmit={handleFormSubmit} isLoading={false} />;
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <Link href={`/analyze/${id}`} className="text-text-secondary hover:text-white transition flex items-center gap-2 mb-8">
                    ← Back to Analysis
                </Link>

                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">🚀 Full Application Kit</h1>
                    <p className="text-text-secondary">Generating everything you need to apply.</p>
                </div>

                <div className="space-y-6">
                    {/* CV Card */}
                    <ProgressCard
                        title="Tailored CV"
                        status={progress.cv}
                        icon="📄"
                        link={`/application/${id}/cv`}
                    />

                    {/* Letter Card */}
                    <ProgressCard
                        title="Cover Letter"
                        status={progress.letter}
                        icon="✉️"
                        link={`/application/${id}/cover-letter`}
                    />

                    {/* Interview Card */}
                    <ProgressCard
                        title="Interview Prep"
                        status={progress.interview}
                        icon="🎤"
                        link={`/application/${id}/interview`}
                    />
                </div>

                {isFinished && (
                    <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-block p-8 rounded-2xl bg-gradient-to-b from-gray-900 to-bg-card border border-gray-800 shadow-2xl">
                            <div className="text-4xl mb-4">🎉</div>
                            <h2 className="text-2xl font-bold mb-2">You&apos;re Ready to Apply!</h2>
                            <p className="text-text-secondary mb-6">All your documents have been generated using AI.</p>

                            <div className="flex justify-center gap-4">
                                <Link href={`/analyze/${id}`} className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition">
                                    Return to Analysis
                                </Link>
                                <button onClick={() => window.print()} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
                                    Print Summary
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface ProgressCardProps {
    title: string;
    status: 'pending' | 'loading' | 'done' | 'error';
    icon: string;
    link: string;
}

function ProgressCard({ title, status, icon, link }: ProgressCardProps) {
    const isDone = status === 'done';
    const isError = status === 'error';
    const isLoading = status === 'loading';
    const isPending = status === 'pending';

    return (
        <div className={`bg-bg-card border rounded-xl p-6 flex items-center justify-between transition-all ${isDone ? 'border-success/50 bg-success/5' :
            isError ? 'border-danger/50 bg-danger/5' :
                isLoading ? 'border-primary/50 bg-primary/5' :
                    'border-gray-800'
            }`}>
            <div className="flex items-center gap-4">
                <div className="text-2xl">{icon}</div>
                <div>
                    <h3 className="font-bold text-lg">{title}</h3>
                    <div className="text-sm">
                        {isLoading && <span className="text-primary animate-pulse">Generating...</span>}
                        {isDone && <span className="text-success">Ready ✅</span>}
                        {isError && <span className="text-danger">Failed ❌</span>}
                        {isPending && <span className="text-gray-500">Waiting...</span>}
                    </div>
                </div>
            </div>

            <div>
                {isDone && (
                    <Link href={link} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-semibold transition">
                        View Result →
                    </Link>
                )}
                {isLoading && (
                    <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
            </div>
        </div>
    );
}
