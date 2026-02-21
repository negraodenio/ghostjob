'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileManager({ initialProfile }: { initialProfile: any }) {
    const router = useRouter();
    const [profile, setProfile] = useState(initialProfile);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            setError('Please upload a PDF file.');
            return;
        }

        setIsUploading(true);
        setError('');
        setSuccess('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/parse-cv', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse CV');
            }

            setSuccess('CV parsed successfully! Your profile has been updated.');
            // Update local state with new profile data
            setProfile((prev: any) => ({
                ...prev,
                ...data.data
            }));

            // Refresh to ensure server data is updated
            router.refresh();

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-bg-card p-8 rounded-2xl border border-gray-800 shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <span className="text-primary">📄</span> Upload CV (PDF)
                </h2>
                <p className="text-text-secondary mb-6 text-sm">
                    We'll extract your experience, skills, and education automatically using AI. This data is used to generate tailor-made CVs and cover letters.
                </p>

                <div className="flex items-center gap-4">
                    <label className="relative cursor-pointer bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white px-6 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-primary/20">
                        {isUploading ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                                Parsing CV using AI...
                            </>
                        ) : (
                            <>
                                <span>Upload PDF</span>
                            </>
                        )}
                        <input
                            type="file"
                            accept="application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isUploading}
                        />
                    </label>
                    {profile?.raw_resume_text && !isUploading && (
                        <span className="text-success text-sm flex items-center gap-1">
                            <span>✅</span> Profile populated from CV
                        </span>
                    )}
                </div>

                {error && <p className="text-danger text-sm mt-4">{error}</p>}
                {success && <p className="text-success text-sm mt-4">{success}</p>}
            </div>

            {/* Profile Info Section */}
            {profile && (
                <div className="bg-bg-card p-8 rounded-2xl border border-gray-800 space-y-6">
                    <h2 className="text-2xl font-bold mb-6 border-b border-gray-800 pb-4">Extracted Profile Data</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Full Name</label>
                            <div className="bg-bg-primary p-3 rounded-lg text-text-primary border border-gray-800">
                                {profile.full_name || 'Not provided'}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-text-secondary mb-1">Location</label>
                            <div className="bg-bg-primary p-3 rounded-lg text-text-primary border border-gray-800">
                                {profile.location || 'Not provided'}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Professional Summary</label>
                        <div className="bg-bg-primary p-3 rounded-lg text-text-primary border border-gray-800 min-h-[60px]">
                            {profile.professional_summary || 'Not provided'}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">Skills</label>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.length > 0 ? profile.skills.map((skill: string, i: number) => (
                                <span key={i} className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-sm">
                                    {skill}
                                </span>
                            )) : <span className="text-text-secondary text-sm">No skills extracted</span>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-2">Recent Experience</label>
                        <div className="space-y-3">
                            {profile.work_experience?.length > 0 ? profile.work_experience.map((exp: any, i: number) => (
                                <div key={i} className="bg-bg-primary p-4 rounded-lg border border-gray-800">
                                    <div className="font-bold">{exp.title}</div>
                                    <div className="text-sm text-text-secondary mb-2">{exp.company} • {exp.period}</div>
                                    <p className="text-sm">{exp.description}</p>
                                </div>
                            )) : <div className="text-text-secondary text-sm bg-bg-primary p-3 rounded-lg">No experience extracted</div>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
