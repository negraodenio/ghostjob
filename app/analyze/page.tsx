'use client';

import Link from 'next/link';
import AnalyzeForm from '@/components/AnalyzeForm';

export default function AnalyzePage() {
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

                <AnalyzeForm />
            </div>
        </div>
    );
}
