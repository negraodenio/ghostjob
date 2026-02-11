'use client';

import Link from 'next/link';

export default function PrivacyPage() {
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
                <h1 className="text-5xl font-black mb-4">Privacy Policy</h1>
                <p className="text-text-secondary mb-12">Last updated: June 2025</p>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>We collect information you provide directly:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Email address (when you create an account)</li>
                                <li>Job descriptions you paste for analysis</li>
                                <li>CVs and cover letters generated through our platform</li>
                            </ul>
                            <p>We also collect automatically:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Usage data (pages visited, features used)</li>
                                <li>Device information (browser type, operating system)</li>
                                <li>IP address (for security and fraud prevention)</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>We use your information to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Provide and improve our ghost job detection service</li>
                                <li>Generate tailored CVs, cover letters, and interview prep</li>
                                <li>Send you account-related notifications</li>
                                <li>Analyze usage patterns to improve the product</li>
                            </ul>
                            <p className="font-bold text-white">We do NOT:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Share your data with employers</li>
                                <li>Sell your personal information to third parties</li>
                                <li>Use your job descriptions for any purpose other than analysis</li>
                                <li>Share your generated CVs or cover letters with anyone</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Data Storage & Security</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Your data is encrypted in transit (TLS) and at rest. We store data on secure cloud servers. Access to personal data is restricted to essential personnel only.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Data Retention</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
                            <li>Job analyses are stored for 90 days, then automatically deleted</li>
                            <li>Account data is retained while your account is active</li>
                            <li>You can delete your data at any time from your dashboard</li>
                            <li>Upon account deletion, all data is removed within 30 days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Your Rights</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>You have the right to:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Access your personal data</li>
                                <li>Correct inaccurate data</li>
                                <li>Delete your data</li>
                                <li>Export your data</li>
                                <li>Withdraw consent at any time</li>
                            </ul>
                            <p>To exercise these rights, contact us at <a href="mailto:privacy@ghostjob.app" className="text-primary hover:underline">privacy@ghostjob.app</a></p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We use essential cookies for authentication and session management. We use analytics cookies (only with your consent) to understand how the product is used. You can disable non-essential cookies in your browser settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">7. Third-Party Services</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>We use the following third-party services:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>OpenAI API</strong> (for AI analysis — job descriptions are sent to their API for processing)</li>
                                <li><strong>Stripe</strong> (for payment processing — we never see or store your full credit card number)</li>
                                <li><strong>Vercel</strong> (for hosting)</li>
                            </ul>
                            <p>Each service has its own privacy policy. We encourage you to review them.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">8. Changes to This Policy</h2>
                        <p className="text-text-secondary leading-relaxed">
                            We may update this policy from time to time. We will notify you of significant changes via email or in-app notification.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">9. Contact</h2>
                        <p className="text-text-secondary leading-relaxed">
                            Questions? Email us at <a href="mailto:privacy@ghostjob.app" className="text-primary hover:underline">privacy@ghostjob.app</a>
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
