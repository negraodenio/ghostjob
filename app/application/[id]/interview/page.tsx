'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

type Difficulty = 'beginner' | 'intermediate' | 'advanced';

interface Question {
    question: string;
    why_they_ask: string;
    sample_answer: string;
    pro_tip: string;
    difficulty: string;
}

interface Section {
    title: string;
    icon: string;
    questions: Question[];
}

interface QuestionToAsk {
    question: string;
    why_its_smart: string;
    what_to_listen_for: string;
}

interface RedFlag {
    flag: string;
    what_it_means: string;
    what_to_do: string;
}

interface SalaryTip {
    tip: string;
    example_phrase: string;
}

interface InterviewPrepData {
    job_title: string;
    company: string;
    total_questions: number;
    estimated_prep_time: string;
    sections: Section[];
    questions_to_ask?: QuestionToAsk[];
    red_flags?: RedFlag[];
    salary_tip?: SalaryTip;
    confidence_boost?: string;
}

export default function InterviewPrepPage() {
    const params = useParams();
    const id = params.id as string;

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [prepData, setPrepData] = useState<InterviewPrepData | null>(null);
    const [difficulty, setDifficulty] = useState<Difficulty>('intermediate');

    // Accordion State
    const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});

    const prepRef = useRef<HTMLDivElement>(null);

    const generatePrep = async () => {
        setIsLoading(true);
        // Reset expanded state on new generation
        setExpandedQuestions({});

        try {
            const response = await fetch('/api/generate-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId: id,
                    difficulty: difficulty
                })
            });

            if (!response.ok) throw new Error('Failed to generate Interview Prep');

            const data = await response.json();
            setPrepData(data.interview_prep);
        } catch (error) {
            console.error('Error generating prep:', error);
            alert('Failed to generate Interview Prep. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAccordion = (sectionIdx: number, questionIdx: number) => {
        const key = `${sectionIdx}-${questionIdx}`;
        setExpandedQuestions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleDownloadPDF = async () => {
        if (!prepRef.current) return;

        try {
            const canvas = await html2canvas(prepRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#0a0a0a' // Dark background
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 10;

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save('interview-prep.pdf');
        } catch (error) {
            console.error('PDF generation failed', error);
            alert('Failed to download PDF');
        }
    };

    const handleCopyAll = () => {
        if (!prepData) return;

        let text = `INTERVIEW PREP FOR ${prepData.job_title} AT ${prepData.company}\n\n`;

        prepData.sections?.forEach((section) => {
            text += `--- ${section.title} ---\n\n`;
            section.questions?.forEach((q) => {
                text += `Q: ${q.question}\n`;
                text += `Why: ${q.why_they_ask}\n`;
                text += `Answer: ${q.sample_answer}\n\n`;
            });
        });

        navigator.clipboard.writeText(text);
        alert('Interview Prep copied to clipboard! ✅');
    };

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
                <h2 className="text-3xl font-bold mb-2">Preparing your interview questions...</h2>
                <p className="text-text-secondary">Difficulty: <span className="capitalize text-primary">{difficulty}</span></p>
                <p className="text-sm text-text-secondary mt-2 opacity-50">This takes a bit longer than the CV (lots of thinking!)</p>
            </div>
        );
    }

    // Initial State (No data yet)
    if (!prepData) {
        return (
            <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full text-center">
                    <Link href={`/analyze/${id}`} className="text-text-secondary hover:text-white transition inline-flex items-center gap-2 mb-8">
                        ← Back to Analysis
                    </Link>

                    <h1 className="text-4xl font-bold mb-4">Interview Prep Generator 🎤</h1>
                    <p className="text-text-secondary mb-12 text-lg">
                        Select a difficulty level and we&apos;ll generate tailored questions based on the job description.
                    </p>

                    {/* Difficulty Switcher */}
                    <div className="flex flex-col md:flex-row justify-center gap-4 mb-12">
                        <DifficultyButton
                            active={difficulty === 'beginner'}
                            onClick={() => setDifficulty('beginner')}
                            color="text-success"
                            borderColor="border-success"
                            bgActive="bg-success/10"
                            emoji="🟢"
                            title="Beginner"
                            desc="Common & Basics"
                        />
                        <DifficultyButton
                            active={difficulty === 'intermediate'}
                            onClick={() => setDifficulty('intermediate')}
                            color="text-warning"
                            borderColor="border-warning"
                            bgActive="bg-warning/10"
                            emoji="🟡"
                            title="Intermediate"
                            desc="Technical & Behavioral"
                        />
                        <DifficultyButton
                            active={difficulty === 'advanced'}
                            onClick={() => setDifficulty('advanced')}
                            color="text-danger"
                            borderColor="border-danger"
                            bgActive="bg-danger/10"
                            emoji="🔴"
                            title="Advanced"
                            desc="System Design & Strategy"
                        />
                    </div>

                    <button
                        onClick={generatePrep}
                        className="px-8 py-4 gradient-purple rounded-xl font-bold text-xl hover:opacity-90 transition shadow-lg shadow-primary/20 flex items-center justify-center gap-3 w-full md:w-auto mx-auto"
                    >
                        <span>Generate Interview Questions</span>
                        <span>🚀</span>
                    </button>
                </div>
            </div>
        );
    }

    // Results State
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <Link href={`/analyze/${id}`} className="text-text-secondary hover:text-white transition flex items-center gap-2">
                        ← Back to Analysis
                    </Link>
                    <div className="flex gap-4">
                        <button onClick={handleCopyAll} className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition text-sm">
                            📋 Copy All
                        </button>
                        <button onClick={handleDownloadPDF} className="px-6 py-2 gradient-purple rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                            📥 Download PDF
                        </button>
                    </div>
                </div>

                <div ref={prepRef} className="space-y-8 pb-12">
                    {/* Header Card */}
                    <div className="bg-bg-card border border-gray-800 rounded-xl p-8 mb-8 text-center bg-gradient-to-b from-gray-900 to-bg-card">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Interview Prep for {prepData.job_title}</h1>
                        <p className="text-xl text-text-secondary mb-6">at {prepData.company}</p>
                        <div className="flex justify-center gap-8 text-sm">
                            <div>
                                <div className="font-bold text-white">{prepData.total_questions} Questions</div>
                                <div className="text-text-secondary">Total</div>
                            </div>
                            <div>
                                <div className="font-bold text-white">{prepData.estimated_prep_time}</div>
                                <div className="text-text-secondary">Est. Time</div>
                            </div>
                        </div>
                    </div>

                    {/* Question Sections */}
                    {prepData.sections?.map((section, sectionIdx: number) => (
                        <div key={sectionIdx} className="space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{section.icon}</span>
                                <h2 className="text-xl font-bold">{section.title}</h2>
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{section.questions?.length} q</span>
                            </div>

                            {section.questions?.map((q, qIdx: number) => {
                                const isOpen = expandedQuestions[`${sectionIdx}-${qIdx}`];
                                return (
                                    <div key={qIdx} className="bg-bg-card border border-gray-800 rounded-lg overflow-hidden transition-all hover:border-gray-700">
                                        <button
                                            onClick={() => toggleAccordion(sectionIdx, qIdx)}
                                            className="w-full text-left p-6 flex justify-between items-start gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="font-semibold text-lg mb-1 flex items-start gap-2">
                                                    <span className="text-primary mt-1">Q{qIdx + 1}:</span>
                                                    {q.question}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge difficulty={q.difficulty} />
                                                <span className="text-gray-500 text-sm transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                                    ▼
                                                </span>
                                            </div>
                                        </button>

                                        {isOpen && (
                                            <div className="px-6 pb-6 pt-0 border-t border-gray-800/50 animate-in slide-in-from-top-2 duration-200">
                                                <div className="mt-4 space-y-4">
                                                    <div className="bg-gray-900/50 p-4 rounded-lg">
                                                        <div className="text-xs font-bold text-text-secondary uppercase mb-1">💡 Why they ask</div>
                                                        <p className="text-sm text-gray-300">{q.why_they_ask}</p>
                                                    </div>

                                                    <div>
                                                        <div className="text-xs font-bold text-success uppercase mb-2">✅ Sample Answer</div>
                                                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{q.sample_answer}</p>
                                                    </div>

                                                    <div className="flex items-start gap-2 text-sm text-purple-300 bg-purple-900/20 p-3 rounded border border-purple-500/20">
                                                        <span className="text-lg">💎</span>
                                                        <p><span className="font-bold">Pro Tip:</span> {q.pro_tip}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Questions to Ask */}
                    {prepData.questions_to_ask && (
                        <div className="bg-bg-card border border-gray-800 rounded-xl p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">🎤</span>
                                <h2 className="text-xl font-bold">Questions to Ask the Interviewer</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {prepData.questions_to_ask.map((item, i: number) => (
                                    <div key={i} className="bg-gray-900/50 p-5 rounded-lg border border-gray-800">
                                        <div className="font-bold text-lg mb-3 text-white">&quot;{item.question}&quot;</div>
                                        <div className="space-y-2 text-sm">
                                            <div className="text-green-400"><span className="font-bold">Why it&apos;s smart:</span> {item.why_its_smart}</div>
                                            <div className="text-yellow-400"><span className="font-bold">Listen for:</span> {item.what_to_listen_for}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Red Flags & Salary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prepData.red_flags && (
                            <div className="bg-bg-card border border-red-900/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🚩</div>
                                <h3 className="text-lg font-bold text-red-500 mb-4 flex items-center gap-2">
                                    <span>🚩</span> Red Flags to Watch
                                </h3>
                                <ul className="space-y-4 relative z-10">
                                    {prepData.red_flags.map((flag, i: number) => (
                                        <li key={i} className="bg-red-900/10 p-3 rounded border border-red-500/20">
                                            <div className="font-bold text-red-300 mb-1">⚠️ &quot;{flag.flag}&quot;</div>
                                            <div className="text-xs text-gray-400">Means: {flag.what_it_means}</div>
                                            <div className="text-xs text-white mt-1">Example Action: {flag.what_to_do}</div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {prepData.salary_tip && (
                            <div className="bg-bg-card border border-green-900/30 rounded-xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">💰</div>
                                <h3 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                                    <span>💰</span> Salary Negotiation Tip
                                </h3>
                                <div className="relative z-10">
                                    <p className="text-gray-300 mb-4">{prepData.salary_tip.tip}</p>
                                    <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30 italic text-green-200">
                                        &quot;{prepData.salary_tip.example_phrase}&quot;
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confidence Boost */}
                    {prepData.confidence_boost && (
                        <div className="text-center py-12 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-2xl border border-white/10">
                            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                                You&apos;re Ready. 🚀
                            </h3>
                            <p className="text-gray-400 max-w-xl mx-auto mb-6">
                                {prepData.confidence_boost}
                            </p>
                            <p className="text-lg font-bold text-white">
                                Go get that job!
                            </p>
                        </div>
                    )}

                    {/* Next Steps Navigation */}
                    <div className="bg-bg-card border border-gray-800 rounded-xl p-6 text-center">
                        <h3 className="text-xl font-bold mb-4">🚀 You&apos;re fully prepared!</h3>
                        <p className="text-text-secondary mb-6">
                            You have a tailored CV, cover letter, and interview prep.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link href={`/analyze/${id}`} className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition">
                                ← Back to Analysis
                            </Link>
                            <Link href="/analyze" className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition">
                                Start New Analysis
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DifficultyButton({ active, onClick, emoji, title, desc, color, borderColor, bgActive }: { active: boolean; onClick: () => void; emoji: string; title: string; desc: string; color: string; borderColor: string; bgActive: string; }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex flex-col items-center p-4 rounded-xl border-2 transition-all w-full md:w-48 text-center relative overflow-hidden
                ${active
                    ? `${borderColor} ${bgActive} shadow-lg`
                    : 'bg-bg-card border-gray-800 hover:border-gray-600'
                }
            `}
        >
            <div className="text-2xl mb-2">{emoji}</div>
            <div className={`font-bold mb-1 ${active ? color : 'text-text-primary'}`}>{title}</div>
            <div className="text-xs text-text-secondary">{desc}</div>
        </button>
    );
}

function Badge({ difficulty }: { difficulty: string }) {
    const colors = {
        easy: 'bg-green-500/20 text-green-400 border-green-500/30',
        medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        hard: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    const c = colors[difficulty as keyof typeof colors] || colors.medium;

    return (
        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${c} uppercase tracking-wider`}>
            {difficulty}
        </span>
    );
}
