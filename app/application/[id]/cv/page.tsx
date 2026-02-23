'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserInfoForm from '@/components/UserInfoForm';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Job {
    title: string;
    company: string;
    period: string;
    bullets?: string[];
}

interface Education {
    degree: string;
    institution: string;
    year: string;
}

interface CVData {
    summary: string;
    skills?: string[];
    experience?: Job[];
    education?: Education[];
    certifications?: string[];
    ats_keywords?: {
        score: number;
        matched?: string[];
        missing?: string[];
    };
    tips?: string[];
}

interface UserInfo {
    fullName: string;
    email: string;
    phone: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export default function CVPage() {
    const params = useParams();
    const id = params.id as string;

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [cvData, setCvData] = useState<CVData | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const cvRef = useRef<HTMLDivElement>(null);

    // Safe localStorage access & auto-generation
    useEffect(() => {
        try {
            const saved = localStorage.getItem('ghostjob_user_info');
            if (saved) {
                const info = JSON.parse(saved);
                setUserInfo(info);
                setIsFormOpen(false);
                handleFormSubmit(info);
            } else {
                setIsFormOpen(true);
            }
        } catch (e) {
            console.error('Failed to access localStorage:', e);
            setIsFormOpen(true);
        }
    }, [id]); // Only run on mount or ID change

    const handleFormSubmit = async (userInfo: UserInfo) => {
        setIsFormOpen(false);
        setIsLoading(true);

        try {
            const response = await fetch('/api/generate-cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    analysisId: id,
                    userInfo
                })
            });

            if (!response.ok) throw new Error('Failed to generate CV');

            const data = await response.json();
            setCvData(data.cv);
        } catch (error) {
            console.error('Error generating CV:', error);
            alert('Failed to generate CV. Please try again.');
            setIsFormOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        if (!cvRef.current) return;

        try {
            const canvas = await html2canvas(cvRef.current, {
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
            const imgY = 0; // Top align

            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save('generated-cv.pdf');
        } catch (error) {
            console.error('PDF generation failed', error);
            alert('Failed to download PDF');
        }
    };

    const handleCopyText = () => {
        if (!cvData) return;

        const text = `
${cvData.summary}

SKILLS
${cvData.skills?.join(', ')}

EXPERIENCE
${cvData.experience?.map((job) => `${job.title} at ${job.company}\n${job.period}\n${job.bullets?.map((b: string) => `• ${b}`).join('\n')}`).join('\n\n')}

EDUCATION
${cvData.education?.map((edu) => `${edu.degree}, ${edu.institution} (${edu.year})`).join('\n')}
        `.trim();

        navigator.clipboard.writeText(text);
        alert('CV copied to clipboard!');
    };

    if (isFormOpen) {
        return <UserInfoForm onSubmit={handleFormSubmit} isLoading={isLoading} />;
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-6"></div>
                <h2 className="text-3xl font-bold mb-2">Crafting your ATS-optimized CV...</h2>
                <p className="text-text-secondary">Tailoring to this specific job description</p>
                <p className="text-sm text-text-secondary mt-2 opacity-50">Usually takes 10-15 seconds</p>
            </div>
        );
    }

    if (!cvData) return null;

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12">
            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <Link href={`/analyze/${id}`} className="text-text-secondary hover:text-white transition flex items-center gap-2">
                        ← Back to Analysis
                    </Link>
                    <div className="flex gap-4">
                        <button onClick={() => setIsFormOpen(true)} className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition text-sm">
                            ✏️ Regenerate
                        </button>
                        <button onClick={handleCopyText} className="px-4 py-2 border border-gray-700 rounded-lg hover:border-gray-500 transition text-sm">
                            📋 Copy Text
                        </button>
                        <button onClick={handleDownloadPDF} className="px-6 py-2 gradient-purple rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                            📥 Download PDF
                        </button>
                    </div>
                </div>

                {/* ATS Score Card */}
                {cvData.ats_keywords && (
                    <div className="bg-bg-card border border-gray-800 rounded-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center md:text-left min-w-[200px]">
                                <div className="text-sm text-text-secondary mb-1">ATS Compatibility Score</div>
                                <div className={`text-4xl font-black ${cvData.ats_keywords.score >= 80 ? 'text-success' :
                                    cvData.ats_keywords.score >= 60 ? 'text-warning' : 'text-danger'
                                    }`}>
                                    {cvData.ats_keywords.score}/100
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-sm font-bold text-success mb-2">Keywords Matched ✅</div>
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.ats_keywords.matched?.map((kw: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-success/10 text-success text-xs rounded-full border border-success/20">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-warning mb-2">Keywords Missing ⚠️</div>
                                        <div className="flex flex-wrap gap-2">
                                            {cvData.ats_keywords.missing?.map((kw: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full border border-warning/20">
                                                    {kw}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CV Preview */}
                <div className="bg-white text-gray-900 rounded-sm shadow-2xl overflow-hidden mb-12 transform transition-all">
                    <div ref={cvRef} className="p-[10mm] min-h-[297mm] w-full max-w-[210mm] mx-auto bg-white">
                        {/* CV Header */}
                        <div className="border-b-2 border-gray-900 pb-6 mb-6">
                            <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2 text-gray-900">
                                {userInfo?.fullName || 'Candidate Name'}
                            </h1>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                                <span>{userInfo?.email || 'email@example.com'}</span>
                                <span>•</span>
                                <span>{userInfo?.phone || 'Phone'}</span>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Professional Summary</h2>
                            <p className="text-gray-800 leading-relaxed text-sm">
                                {cvData.summary}
                            </p>
                        </div>

                        {/* Skills */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Technical Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {cvData.skills?.map((skill: string, i: number) => (
                                    <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-1">Professional Experience</h2>
                            <div className="space-y-6">
                                {cvData.experience?.map((job, i: number) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-baseline mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{job.title}</h3>
                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded">{job.period}</span>
                                        </div>
                                        <div className="text-sm font-semibold text-gray-700 mb-2">{job.company}</div>
                                        <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                                            {job.bullets?.map((bullet: string, j: number) => (
                                                <li key={j} className="pl-1">{bullet}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Education */}
                        <div className="mb-8">
                            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-1">Education</h2>
                            <div className="space-y-4">
                                {cvData.education?.map((edu, i: number) => (
                                    <div key={i} className="flex justify-between items-baseline">
                                        <div>
                                            <div className="font-bold text-gray-900">{edu.degree}</div>
                                            <div className="text-sm text-gray-600">{edu.institution}</div>
                                        </div>
                                        <div className="text-sm text-gray-500">{edu.year}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certifications (Optional) */}
                        {cvData.certifications && cvData.certifications.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-200 pb-1">Certifications</h2>
                                <ul className="list-disc pl-4 space-y-1 text-sm text-gray-600">
                                    {cvData.certifications.map((cert: string, i: number) => (
                                        <li key={i}>{cert}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Footer for PDF */}
                        <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400">
                            Generated with GhostJob.app
                        </div>
                    </div>
                </div>

                {/* Tips Section */}
                {cvData.tips && (
                    <div className="bg-bg-card border border-gray-800 rounded-xl p-6">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            💡 Tips to Improve Your CV
                        </h3>
                        <ul className="space-y-3">
                            {cvData.tips.map((tip: string, i: number) => (
                                <li key={i} className="flex items-start gap-3 text-text-secondary">
                                    <span className="text-primary mt-1">•</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Next Step Navigation */}
                <div className="bg-bg-card border border-gray-800 rounded-xl p-6 text-center mt-8">
                    <h3 className="text-xl font-bold mb-2">✅ CV Ready! What&apos;s next?</h3>
                    <div className="flex justify-center gap-4 mt-4">
                        <Link href={`/analyze/${id}`} className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition">
                            ← Back to Analysis
                        </Link>
                        <Link href={`/application/${id}/cover-letter`} className="px-6 py-3 gradient-purple rounded-lg font-bold hover:opacity-90 transition shadow-lg shadow-primary/20 flex items-center gap-2">
                            <span>Write Cover Letter</span>
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
