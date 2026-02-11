'use client';

import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            {/* Header */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-20 max-w-4xl">
                <h1 className="text-5xl font-black mb-4">Terms of Service</h1>
                <p className="text-text-secondary mb-12">Last updated: June 2025</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-text-secondary leading-relaxed">
                            By using GhostJob, you agree to these terms. If you don&apos;t agree, please don&apos;t use the service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>GhostJob is an AI-powered tool that:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Analyzes job descriptions to detect potential ghost jobs</li>
                                <li>Generates tailored CVs, cover letters, and interview prep</li>
                                <li>Provides a community Ghost Wall for sharing suspicious postings</li>
                            </ul>
                            <p>
                                The Ghost Score is a probability estimate, not a guarantee. We cannot confirm with 100% certainty whether any job is real or fake. Use the information as one factor in your job search decisions.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Account & Billing</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Free accounts:</strong> 3 ghost checks per month, 1 CV generation</li>
                                <li><strong>Pro accounts ($9/month):</strong> Unlimited checks, CVs, cover letters, full interview prep</li>
                                <li><strong>Premium accounts ($19/month):</strong> Everything in Pro plus company research, salary negotiation, priority AI</li>
                            </ul>
                            <p>
                                Payments are processed by Stripe. You can cancel anytime from your dashboard. Cancellation takes effect at the end of your current billing period. No refunds for partial months.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Acceptable Use</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>You agree NOT to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Use the service to harass, defame, or harm others</li>
                                <li>Post false information to the Ghost Wall intentionally</li>
                                <li>Attempt to reverse-engineer our AI or scoring algorithm</li>
                                <li>Use automated scripts to mass-analyze job postings</li>
                                <li>Resell or redistribute generated content commercially</li>
                                <li>Impersonate others or create fake accounts</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Content Ownership</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
                            <li>You own all CVs, cover letters, and content generated for you</li>
                            <li>Job descriptions you paste remain the property of their original authors — we only process them for analysis</li>
                            <li>Ghost Wall posts are public and may be viewed by anyone</li>
                            <li>We retain the right to use anonymized, aggregated data for research and product improvement</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. AI Disclaimer</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Our analysis is generated by AI and should be used as guidance, not as definitive proof. We are not responsible for decisions made based on our ghost score or analysis. Always do your own research before applying to or rejecting a job opportunity.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
                        <p className="text-text-secondary leading-relaxed">
                            GhostJob is provided &quot;as is&quot;. We make no warranties about the accuracy, reliability, or completeness of our analysis. We are not liable for any damages arising from your use of the service, including missed job opportunities or time spent on applications.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. Termination</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may suspend or terminate your account if you violate these terms. You may delete your account at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Changes to Terms</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may update these terms. Continued use after changes constitutes acceptance. We&apos;ll notify you of significant changes via email.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Questions? Email us at <a href="mailto:hello@ghostjob.app" className="text-primary hover:underline">hello@ghostjob.app</a>
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-12 border-t border-gray-800">
                    <Link href="/" className="text-primary hover:underline">← Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
