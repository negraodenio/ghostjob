'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserInfoForm from '@/components/UserInfoForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Tone = 'professional' | 'friendly' | 'bold';

interface CoverLetterData {
    greeting: string;
    paragraphs: string[];
    closing: string;
    full_text?: string;
    word_count?: number;
    tone_used?: string;
    requirements_addressed?: string[];
    strengths?: string[];
    tips?: string[];
}

interface UserInfo {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    portfolio?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow other fields for now
}

export default function CoverLetterPage() {
    const params = useParams();
    const id = params.id as string;

    // State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [letterData, setLetterData] = useState<CoverLetterData | null>(null);
    const [tone, setTone] = useState<Tone>('professional');
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const letterRef = useRef<HTMLDivElement>(null);

    const generateLetter = useCallback(async (info: UserInfo, selectedTone: Tone) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId: id,
                    userInfo: info,
                    tone: selectedTone
                })
            });

            if (!response.ok) throw new Error('Failed to generate Cover Letter');

            const data = await response.json();
            setLetterData(data.cover_letter);
            setUserInfo(info); // Update local state
        } catch (error) {
            console.error('Error generating letter:', error);
            alert('Failed to generate Cover Letter. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Load user info on mount to check if we need to show form
    useEffect(() => {
        const checkSavedInfo = async () => {
            try {
                const saved = localStorage.getItem('ghostjob_user_info');
                if (saved) {
                    const info = JSON.parse(saved) as UserInfo;
                    setUserInfo(info);
                    setIsFormOpen(false);
                    generateLetter(info, tone);
                } else {
                    setIsFormOpen(true);
                }
            } catch (e) {
                console.error('Failed to access localStorage:', e);
                setIsFormOpen(true);
            }
        };
        checkSavedInfo();
    }, [id]); // Only run on mount or ID change

    const handleFormSubmit = (data: UserInfo) => {
        setIsFormOpen(false);
        setUserInfo(data);
        generateLetter(data, tone);
    };

    const handleToneChange = (newTone: Tone) => {
        if (newTone === tone) return;
        setTone(newTone);
        if (userInfo) {
            generateLetter(userInfo, newTone);
        }
    };

    const handleDownloadPDF = async () => {
        if (!letterRef.current) return;

        try {
            const canvas = await html2canvas(letterRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 20; // Top margin

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save('cover-letter.pdf');
        } catch (error) {
            console.error('PDF generation failed', error);
            alert('Failed to download PDF');
        }
    };

    const handleCopyText = () => {
        if (!letterData?.full_text) return;
        navigator.clipboard.writeText(letterData.full_text);
        alert('Cover letter copied to clipboard! ✅');
    };

    if (isFormOpen) {
        return <UserInfoForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
    }

    if (!letterData) {
        if (isLoading) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
                    <h2 className="text-3xl font-bold mb-2">Writing your cover letter...</h2>
                    <p className="text-text-secondary">Tone: <span className="capitalize text-primary">{tone}</span></p>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <p className="mb-4">Something went wrong.</p>
                <button onClick={() => setIsFormOpen(true)} className="px-6 py-2 gradient-purple rounded-lg">Try Again</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12">
            <div className="max-w-6xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <Link href={`/analyze/${id}`} className="text-text-secondary hover:text-white transition flex items-center gap-2">
                        ← Back to Analysis
                    </Link>
                    <div className="flex gap-4">
                        <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition text-sm">
                            ✏️ Edit Info
                        </button>
                        <button onClick={handleCopyText} className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition text-sm">
                            📋 Copy Text
                        </button>
                        <button onClick={handleDownloadPDF} className="px-6 py-2 gradient-purple rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                            📥 Download PDF
                        </button>
                    </div>
                </div>

                {/* Tone Switcher */}
                <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
                    <ToneButton
                        active={tone === 'professional'}
                        onClick={() => handleToneChange('professional')}
                        emoji="🏢"
                        title="Professional"
                        desc="Formal & corporate"
                    />
                    <ToneButton
                        active={tone === 'friendly'}
                        onClick={() => handleToneChange('friendly')}
                        emoji="😊"
                        title="Friendly"
                        desc="Warm & personable"
                    />
                    <ToneButton
                        active={tone === 'bold'}
                        onClick={() => handleToneChange('bold')}
                        emoji="🔥"
                        title="Bold"
                        desc="Confident & standout"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Letter Preview */}
                    <div className="lg:col-span-2">
                        {isLoading && (
                            <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center rounded-xl backdrop-blur-sm">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        )}
                        <div className={`bg-bg-card border border-gray-800 rounded-xl p-1 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="bg-[#fcfbf9] text-gray-900 rounded-lg shadow-2xl overflow-hidden">
                                <div ref={letterRef} className="p-[20mm] min-h-[297mm] w-full bg-[#fcfbf9]">
                                    {/* Letter Content */}
                                    <div className="text-right text-gray-500 text-sm mb-12 font-serif">
                                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>

                                    <div className="font-bold text-lg mb-6 text-gray-900 font-serif">
                                        {letterData.greeting}
                                    </div>

                                    <div className="space-y-6 text-gray-800 leading-relaxed font-serif text-[1.05rem]">
                                        {letterData.paragraphs?.map((para: string, i: number) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </div>

                                    <div className="mt-12 text-gray-900 font-serif">
                                        {letterData.closing}
                                        <div className="mt-8 font-bold text-xl">{userInfo?.fullName || 'Candidate Name'}</div>
                                        <div className="text-sm text-gray-500 mt-1 space-y-1">
                                            <div>{userInfo?.email}</div>
                                            <div>{userInfo?.phone}</div>
                                            {userInfo?.linkedin && <div>{userInfo.linkedin}</div>}
                                            {userInfo?.portfolio && <div>{userInfo.portfolio}</div>}
                                        </div>
                                    </div>

                                    <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400 font-sans">
                                        Generated with GhostJob.app
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Next Step Navigation */}
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-6 text-center mt-8">
                            <h3 className="text-xl font-bold mb-2">✅ Cover Letter Ready! What&apos;s next?</h3>
                            <div className="flex justify-center gap-4 mt-4">
                                <Link href={`/analyze/${id}`} className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition">
                                    ← Back to Analysis
                                </Link>
                                <Link href={`/application/${id}/interview`} className="px-6 py-3 gradient-purple rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <span>Prepare for Interview</span>
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Stats Card */}
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-text-secondary uppercase tracking-widest mb-4">Letter Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">Word Count</span>
                                    <span className="font-mono font-bold">{letterData.word_count || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-text-secondary">Tone</span>
                                    <span className="capitalize text-primary font-bold">{letterData.tone_used || tone}</span>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-text-secondary">Requirements Addressed</span>
                                        <span className="font-bold text-success">{letterData.requirements_addressed?.length || 0}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-success w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Requirements */}
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-success uppercase tracking-widest mb-4">Requirements Addressed ✅</h3>
                            <ul className="space-y-3">
                                {letterData.requirements_addressed?.map((req: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                                        <span className="text-success mt-0.5">✓</span>
                                        {req}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Strengths */}
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">Why this works 💪</h3>
                            <ul className="space-y-3">
                                {letterData.strengths?.map((str: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <span className="text-purple-500 mt-0.5">•</span>
                                        {str}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-6">
                            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-widest mb-4">Tips to Personalize 💡</h3>
                            <ul className="space-y-3">
                                {letterData.tips?.map((tip: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                                        <span className="text-yellow-500 mt-0.5">!</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ToneButtonProps {
    active: boolean;
    onClick: () => void;
    emoji: string;
    title: string;
    desc: string;
}

function ToneButton({ active, onClick, emoji, title, desc }: ToneButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-start p-4 rounded-xl border transition-all w-full md:w-48 text-left relative overflow-hidden group
                ${active
                    ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'bg-bg-card border-gray-800 hover:border-gray-600 hover:bg-bg-card/80'
                }
            `}
        >
            <div className={`text-2xl mb-2 grayscale group-hover:grayscale-0 transition ${active ? 'grayscale-0' : ''}`}>{emoji}</div>
            <div className={`font-bold mb-1 ${active ? 'text-primary' : 'text-text-primary'}`}>{title}</div>
            <div className="text-xs text-text-secondary">{desc}</div>
        </button>
    );
}
