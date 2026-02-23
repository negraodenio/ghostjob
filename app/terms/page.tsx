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
                <p className="text-text-secondary mb-12">Last updated: February 2026</p>

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
                            <p>GhostJob is a job market transparency platform that:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Analyzes job descriptions to calculate a <strong>Ghost Score</strong> and <strong>Hiring Integrity Score</strong> for companies</li>
                                <li>Tracks real-world application outcomes (response, interview, offer, rejection) submitted voluntarily by users</li>
                                <li>Publishes anonymised, aggregated company transparency rankings and market reports</li>
                                <li>Generates personalized application materials: CVs, cover letters, and interview preparation — each tailored to the specific job analyzed</li>
                                <li>Provides a community Ghost Wall for surfacing suspicious job postings</li>
                            </ul>
                            <p>
                                All scores (Ghost Score, Hiring Integrity Score) are probability estimates based on pattern analysis and community-reported outcomes. They are <strong>not legal determinations</strong> and should be used as one signal among many in your job search decisions.
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
                        <h2 className="text-2xl font-bold mb-4">5. Content &amp; Data Ownership</h2>
                        <ul className="list-disc pl-6 space-y-2 text-text-secondary leading-relaxed">
                            <li>You own all CVs, cover letters, and content generated for you</li>
                            <li>Job descriptions you paste remain the property of their original authors — we only process them for analysis</li>
                            <li>Outcome data you report (responses, interviews, offers) is used only in anonymised, aggregated form to improve scoring accuracy and build company transparency rankings</li>
                            <li>Ghost Wall posts are public and may be viewed by anyone</li>
                            <li>We retain the right to use anonymised, aggregated data for research, product improvement, and published market reports</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5.5 Outcome Data &amp; Privacy</h2>
                        <div className="space-y-4 text-text-secondary leading-relaxed">
                            <p>Outcome tracking (reporting what happened after you applied) is opt-in. When you report an outcome:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Your individual data is <strong>never shared with employers</strong> or third parties</li>
                                <li>Company-level data is only published when a minimum of 10 applications have been tracked for that company (anonymity threshold)</li>
                                <li>You can delete your outcome data at any time from your account settings</li>
                                <li>We are GDPR compliant. Upon account deletion, all personal data is removed within 30 days</li>
                            </ul>
                        </div>
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
                            Questions? Email us at <a href="mailto:hello@ghostjob.app" className="text-primary hover:underline">hello@ghostjob.app</a>. For B2B or partnership enquiries: <a href="mailto:intelligence@ghostjob.app" className="text-primary hover:underline">intelligence@ghostjob.app</a>
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
