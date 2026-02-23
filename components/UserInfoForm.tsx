'use client';

import { useState, useEffect } from 'react';

interface UserInfo {
    fullName: string;
    email: string;
    phone: string;
    currentTitle: string;
    yearsExperience: number;
    linkedin?: string;
    portfolio?: string;
    skills?: string;
    experience?: string;
    education?: string;
    certifications?: string;
    languages?: string;
}

interface UserInfoFormProps {
    onSubmit: (data: UserInfo) => void;
    isLoading: boolean;
}

export default function UserInfoForm({ onSubmit, isLoading }: UserInfoFormProps) {
    const [formData, setFormData] = useState<UserInfo>({
        fullName: '',
        email: '',
        phone: '',
        currentTitle: '',
        yearsExperience: 0,
        linkedin: '',
        portfolio: '',
        skills: '',
        experience: '',
        education: '',
        certifications: '',
        languages: '',
    });

    const [showOptional, setShowOptional] = useState(false);
    const [isParsing, setIsParsing] = useState(false);

    // LinkedIn Sync Status
    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('ghostjob_user_info');
            if (saved) {
                setFormData(JSON.parse(saved));
            }

            // Check for profile data shared from extension
            const sharedProfile = localStorage.getItem('ghostjob_profile_sync');
            if (sharedProfile) {
                const profile = JSON.parse(sharedProfile);
                setFormData(prev => ({ ...prev, ...profile }));
                setSyncStatus('synced');
                // Clear the sync trigger
                localStorage.removeItem('ghostjob_profile_sync');
            }
        } catch (e) {
            console.error('Failed to access localStorage', e);
        }
    }, []);

    // Listen for cross-tab storage events (from extension injection)
    useEffect(() => {
        const handleSync = () => {
            const sharedProfile = localStorage.getItem('ghostjob_profile_sync');
            if (sharedProfile) {
                try {
                    const profile = JSON.parse(sharedProfile);
                    setFormData(prev => ({ ...prev, ...profile }));
                    setSyncStatus('synced');
                    localStorage.removeItem('ghostjob_profile_sync');
                } catch (e) { console.error(e); }
            }
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/parse-cv', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to parse CV');

            const result = await response.json();
            const data = result.data;

            setFormData(prev => ({
                ...prev,
                fullName: data.full_name || prev.fullName,
                email: data.email || data.phone || prev.email, // sometimes email is phone in raw text if not careful
                phone: data.phone || prev.phone,
                currentTitle: data.work_experience?.[0]?.title || prev.currentTitle,
                skills: data.skills?.join(', ') || prev.skills,
                experience: data.work_experience?.map((w: any) => `${w.title} at ${w.company}\n${w.description}`).join('\n\n') || prev.experience,
                education: data.education?.map((e: any) => `${e.degree}, ${e.institution}`).join('\n') || prev.education,
            }));
            setShowOptional(true);
        } catch (error) {
            console.error('Error parsing CV:', error);
            alert('Failed to parse CV. Try manual entry.');
        } finally {
            setIsParsing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'yearsExperience' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            localStorage.setItem('ghostjob_user_info', JSON.stringify(formData));
        } catch (e) {
            console.error('Failed to save to localStorage', e);
        }
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-bg-card border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 my-8">
                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Let&apos;s Build Your Perfect Kit</h2>
                        <p className="text-text-secondary mb-6">
                            Choose how you&apos;d like to provide your information.
                            <br />
                            <span className="text-xs opacity-70">Your data is saved locally and never shared.</span>
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <button
                                type="button"
                                onClick={() => {
                                    setSyncStatus('syncing');
                                    setTimeout(() => {
                                        if (syncStatus !== 'synced') setSyncStatus('idle');
                                    }, 5000);
                                }}
                                className={`flex flex-col items-center p-4 rounded-xl border transition group ${syncStatus === 'synced' ? 'border-success bg-success/10' : 'border-gray-800 bg-bg-primary hover:border-primary'}`}
                            >
                                <span className="text-2xl mb-2">{syncStatus === 'synced' ? '✅' : '🔗'}</span>
                                <span className="text-sm font-bold">{syncStatus === 'synced' ? 'LinkedIn Synced' : 'Sync LinkedIn'}</span>
                                <span className="text-[10px] text-text-secondary">
                                    {syncStatus === 'syncing' ? 'Open Extension...' : 'Via Extension'}
                                </span>
                            </button>
                            <div className="relative">
                                <input
                                    type="file"
                                    id="cv-upload"
                                    className="hidden"
                                    accept=".pdf"
                                    onChange={handleFileUpload}
                                />
                                <button
                                    type="button"
                                    disabled={isParsing}
                                    onClick={() => document.getElementById('cv-upload')?.click()}
                                    className="w-full flex flex-col items-center p-4 rounded-xl border border-gray-800 bg-bg-primary hover:border-primary transition group disabled:opacity-50"
                                >
                                    <span className="text-2xl mb-2">{isParsing ? '⏳' : '📄'}</span>
                                    <span className="text-sm font-bold">{isParsing ? 'Parsing...' : 'Import CV'}</span>
                                    <span className="text-[10px] text-text-secondary">PDF (AI Powered)</span>
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowOptional(true)}
                                className="flex flex-col items-center p-4 rounded-xl border border-primary bg-primary/10 transition group"
                            >
                                <span className="text-2xl mb-2">✍️</span>
                                <span className="text-sm font-bold">Manual Entry</span>
                                <span className="text-[10px] text-text-secondary">Fill below</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Required Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    required
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                    placeholder="john@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-2">Current Job Title *</label>
                                <input
                                    type="text"
                                    name="currentTitle"
                                    required
                                    value={formData.currentTitle}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold mb-2">Years of Experience *</label>
                                <input
                                    type="number"
                                    name="yearsExperience"
                                    required
                                    min="0"
                                    max="50"
                                    value={formData.yearsExperience}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                />
                            </div>
                        </div>

                        {/* Optional Fields Toggle */}
                        <div className="border-t border-gray-800 pt-6">
                            <button
                                type="button"
                                onClick={() => setShowOptional(!showOptional)}
                                className="flex items-center text-primary font-semibold hover:underline"
                            >
                                {showOptional ? '▼ Hide detailed info' : '▶ Add more details for a better CV (Recommended)'}
                            </button>
                        </div>

                        {/* Optional Fields */}
                        {showOptional && (
                            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">LinkedIn URL</label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={formData.linkedin}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                            placeholder="https://linkedin.com/in/..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Portfolio / Website</label>
                                        <input
                                            type="url"
                                            name="portfolio"
                                            value={formData.portfolio}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                            placeholder="https://myportfolio.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Key Skills</label>
                                    <textarea
                                        name="skills"
                                        rows={3}
                                        value={formData.skills}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                        placeholder="Python, React, AWS, Project Management, Public Speaking..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Work Experience</label>
                                    <textarea
                                        name="experience"
                                        rows={5}
                                        value={formData.experience}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                        placeholder="Paste your resume work history or describe your last role..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">Education</label>
                                    <textarea
                                        name="education"
                                        rows={2}
                                        value={formData.education}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                        placeholder="BSc Computer Science, MIT, 2020"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Certifications</label>
                                        <textarea
                                            name="certifications"
                                            rows={2}
                                            value={formData.certifications}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                            placeholder="AWS Solutions Architect, PMP..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-2">Languages</label>
                                        <textarea
                                            name="languages"
                                            rows={2}
                                            value={formData.languages}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                            placeholder="English (Native), Spanish (Fluent)..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-800">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-4 gradient-purple rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-primary/20"
                            >
                                {isLoading ? 'Generating CV...' : 'Generate My CV 📄'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
