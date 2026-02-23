'use client';

import Link from 'next/link';
import { useState } from 'react';

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: '€0',
        period: '/month',
        description: 'For curious job seekers.',
        badge: null,
        cta: 'Get Started Free',
        ctaHref: '/login',
        ctaStyle: 'border border-gray-700 hover:border-gray-500',
        features: [
            { text: '3 ghost analyses per month', included: true },
            { text: 'Ghost Score + Verdict', included: true },
            { text: 'Red & Green Flag Breakdown', included: true },
            { text: 'Basic company transparency data', included: true },
            { text: 'Unlimited analyses', included: false },
            { text: 'Tailored CV for every job', included: false },
            { text: 'Cover Letter generator', included: false },
            { text: 'Interview Prep & Cheat Sheet', included: false },
            { text: 'Application outcome tracking', included: false },
            { text: 'Company response rate history', included: false },
            { text: 'Outcome alerts (7d, 14d, 30d)', included: false },
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '€19',
        period: '/month',
        description: 'For serious candidates who play to win.',
        badge: 'Most Popular',
        cta: 'Start Pro Free — 7 Days',
        ctaHref: '/login?plan=pro',
        ctaStyle: 'gradient-purple',
        features: [
            { text: 'Unlimited ghost analyses', included: true },
            { text: 'Ghost Score + Verdict', included: true },
            { text: 'Red & Green Flag Breakdown', included: true },
            { text: 'Full company transparency profile', included: true },
            { text: 'Tailored CV for every job (ATS-optimised)', included: true },
            { text: 'Cover Letter generator', included: true },
            { text: 'Interview Prep & Cheat Sheet', included: true },
            { text: 'Application outcome tracking', included: true },
            { text: 'Company response rate history', included: true },
            { text: 'Automated outcome alerts (7d, 14d, 30d)', included: true },
            { text: 'B2B Intelligence Dashboard', included: false },
        ],
    },
    {
        id: 'b2b',
        name: 'Intelligence',
        price: 'Custom',
        period: '',
        description: 'For companies that want to understand their hiring reputation.',
        badge: 'B2B',
        cta: 'Talk to Sales',
        ctaHref: 'mailto:hello@ghostjob.app?subject=GhostProof Intelligence',
        ctaStyle: 'border border-primary text-primary hover:bg-primary/10',
        features: [
            { text: 'Everything in Pro', included: true },
            { text: 'Company Hiring Integrity Dashboard', included: true },
            { text: 'Response rate benchmarking vs. competitors', included: true },
            { text: 'Ghost Job Rate monitoring', included: true },
            { text: '"Verified Transparent Employer" Badge', included: true },
            { text: 'Quarterly hiring audit report', included: true },
            { text: 'Right of Reply on public rankings', included: true },
            { text: 'API access (GhostProof Intelligence™)', included: true },
            { text: 'Slack/Teams alerts on reputation changes', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'White-label reports', included: true },
        ],
    },
];

export default function PricingPage() {
    const [annual, setAnnual] = useState(false);

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            {/* Nav */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <Link href="/login" className="px-5 py-2 gradient-purple rounded-lg text-sm font-semibold hover:opacity-90 transition">
                        Get Started Free
                    </Link>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-24 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-6">
                    <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6 border border-primary/30">
                        Simple, Transparent Pricing
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter">
                        Stop Wasting Time on<br />
                        <span className="text-primary italic">Fake Jobs.</span>
                    </h1>
                    <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10">
                        Every plan includes our Ghost Score engine and company transparency data.
                        Pro adds the full application suite — CV, cover letter, interview prep — all tailored to each job.
                    </p>

                    {/* Annual toggle */}
                    <div className="flex items-center justify-center gap-4 mb-16">
                        <span className={`text-sm font-semibold ${!annual ? 'text-white' : 'text-text-secondary'}`}>Monthly</span>
                        <button
                            onClick={() => setAnnual(v => !v)}
                            className={`w-12 h-6 rounded-full transition-all duration-300 relative ${annual ? 'bg-primary' : 'bg-gray-700'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${annual ? 'left-7' : 'left-1'}`} />
                        </button>
                        <span className={`text-sm font-semibold ${annual ? 'text-white' : 'text-text-secondary'}`}>
                            Annual <span className="text-success text-xs font-black ml-1">Save 20%</span>
                        </span>
                    </div>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                    {PLANS.map((plan) => {
                        const displayPrice = plan.id === 'pro' && annual
                            ? '€15'
                            : plan.price;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl p-8 flex flex-col border transition-all duration-300 ${plan.id === 'pro'
                                        ? 'border-primary/60 bg-gradient-to-b from-primary/10 to-bg-card shadow-2xl shadow-primary/20 scale-[1.02]'
                                        : 'border-gray-800 bg-bg-card hover:border-gray-600'
                                    }`}
                            >
                                {plan.badge && (
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${plan.id === 'pro' ? 'bg-primary text-white' : 'bg-white/10 text-white'
                                        }`}>
                                        {plan.badge}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <div className="text-xs font-black uppercase tracking-widest text-text-secondary mb-2">{plan.name}</div>
                                    <div className="flex items-baseline gap-1 mb-3">
                                        <span className="text-5xl font-black">{displayPrice}</span>
                                        {plan.period && <span className="text-text-secondary">{plan.period}</span>}
                                    </div>
                                    <p className="text-text-secondary text-sm leading-relaxed">{plan.description}</p>
                                </div>

                                <ul className="space-y-3 flex-1 mb-8">
                                    {plan.features.map((f, i) => (
                                        <li key={i} className={`flex items-start gap-3 text-sm ${f.included ? 'text-text-primary' : 'text-text-secondary opacity-40'}`}>
                                            <span className="mt-0.5 flex-shrink-0">
                                                {f.included ? '✅' : '✗'}
                                            </span>
                                            {f.text}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    href={plan.ctaHref}
                                    className={`w-full py-4 rounded-xl font-bold text-center transition-all block text-sm ${plan.ctaStyle}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        );
                    })}
                </div>

                {/* Proof of value section */}
                <div className="bg-bg-card rounded-3xl border border-gray-800 p-10 mb-20 text-center">
                    <h2 className="text-3xl font-black mb-4">Why Pro Users Win More Interviews</h2>
                    <p className="text-text-secondary mb-10 max-w-xl mx-auto">
                        Our data shows clear correlation between ghost score filtering and application outcomes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { stat: '42%', label: 'of jobs analyzed are ghost jobs', sub: 'You skip these automatically on Pro' },
                            { stat: '3.1×', label: 'more interviews', sub: 'Pro users vs. unfiltered applications' },
                            { stat: '8 hrs', label: 'saved per job search week', sub: 'Not wasting time on fake postings' },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-bg-primary rounded-2xl border border-gray-800">
                                <div className="text-4xl font-black text-primary mb-2">{item.stat}</div>
                                <div className="font-bold mb-1">{item.label}</div>
                                <div className="text-text-secondary text-xs">{item.sub}</div>
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-text-secondary mt-8 italic">
                        *Outcome metrics based on early user reports. Live R² published at 500+ tracked applications — model calibration in progress.
                    </p>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl font-black mb-10 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        {[
                            {
                                q: 'Does the CV generator work for any job type?',
                                a: 'Yes. The CV, cover letter, and interview prep are generated specifically for each job description you analyze. They\'re ATS-optimised and tailored to the exact role, not generic templates.',
                            },
                            {
                                q: 'What is application outcome tracking?',
                                a: 'After you apply to a job, you can report back what happened (interview, offer, rejection, no response). This data — anonymised — improves our ghost score accuracy for everyone and builds the company transparency rankings.',
                            },
                            {
                                q: 'Can I cancel anytime?',
                                a: 'Yes. Cancel from your dashboard at any time. Your Pro access continues until the end of the billing period. No questions asked.',
                            },
                            {
                                q: 'What is GhostProof Intelligence (B2B)?',
                                a: 'It\'s a dashboard for companies to monitor their own hiring reputation, response rates, and how they rank vs competitors. Companies pay to improve their score and earn the "Verified Transparent Employer" badge.',
                            },
                            {
                                q: 'Is my data private?',
                                a: 'All outcome data you report is used only in anonymised, aggregated form for rankings and research. We never sell individual data. You can delete your account and all data at any time (GDPR compliant).',
                            },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-bg-card rounded-2xl border border-gray-800">
                                <h3 className="font-bold mb-3">{item.q}</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="text-center bg-gradient-to-br from-primary/20 to-bg-card rounded-3xl border border-primary/30 p-16">
                    <h2 className="text-4xl font-black mb-4">Start Free. No Credit Card.</h2>
                    <p className="text-text-secondary mb-8">3 ghost analyses/month, free forever. Upgrade when you need unlimited.</p>
                    <Link
                        href="/login"
                        className="inline-block px-12 py-5 gradient-purple rounded-xl font-bold text-lg hover:opacity-90 transition transform hover:scale-105 shadow-xl"
                    >
                        Create Free Account 👻
                    </Link>
                </div>
            </div>
        </div>
    );
}
