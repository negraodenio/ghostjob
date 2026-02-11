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

    useEffect(() => {
        const saved = localStorage.getItem('ghostjob_user_info');
        if (saved) {
            try {
                setFormData(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse saved user info', e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'yearsExperience' ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('ghostjob_user_info', JSON.stringify(formData));
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-bg-card border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-300 my-8">
                <div className="p-6 md:p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold mb-2">Let&apos;s Build Your Perfect CV</h2>
                        <p className="text-text-secondary">
                            We&apos;ll use this info to tailor your resume specifically for this job.
                            <br />
                            <span className="text-xs opacity-70">Your data is saved locally and never shared.</span>
                        </p>
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
