'use client';

import Link from 'next/link';

export default function MethodologyPage() {
    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            {/* Sticky Navigation Bar */}
            <nav className="sticky top-0 z-50 border-b border-gray-800 bg-bg-card/80 backdrop-blur-md">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2 shrink-0">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <div className="flex space-x-4 md:space-x-8 overflow-x-auto no-scrollbar py-2 text-sm md:text-base font-semibold text-text-secondary whitespace-nowrap px-4">
                        <button onClick={() => scrollToSection('problem')} className="hover:text-primary transition">The Problem</button>
                        <button onClick={() => scrollToSection('dimensions')} className="hover:text-primary transition">Three Dimensions</button>
                        <button onClick={() => scrollToSection('red-flags')} className="hover:text-primary transition">Red Flags</button>
                        <button onClick={() => scrollToSection('green-flags')} className="hover:text-primary transition">Green Flags</button>
                        <button onClick={() => scrollToSection('ghost-score')} className="hover:text-primary transition">Ghost Score</button>
                        <button onClick={() => scrollToSection('research')} className="hover:text-primary transition">Research</button>
                        <button onClick={() => scrollToSection('data')} className="hover:text-primary transition">Data</button>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-20 max-w-6xl">
                {/* HERO SECTION */}
                <header className="text-center mb-24">
                    <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6 border border-primary/30">
                        Science, Not Guesswork
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-8">How We Detect<br />Ghost Jobs</h1>
                    <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                        Our AI analyzes every job description across three research-backed dimensions and 15+ signals to calculate the probability of a posting being fake.
                    </p>
                </header>

                {/* SECTION 1 — The Information Asymmetry Problem */}
                <section id="problem" className="mb-32 scroll-mt-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-4xl font-bold mb-8">The Information Asymmetry Problem</h2>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
                                <p>
                                    When a company posts a job, they know if it&apos;s real. You don&apos;t.
                                    This is called information asymmetry — a concept that won George Akerlof the Nobel Prize in Economics (2001).
                                </p>
                                <p>
                                    <span className="text-white font-bold">43% of companies admit to posting jobs they have no intention of filling</span> (Clarify Capital, 2022). That means nearly half of your job applications might be going to ghost jobs — positions that exist only on paper.
                                </p>
                                <p>
                                    GhostJob uses AI to reduce this asymmetry. We analyze the language, structure, and signals in every job description to estimate the probability of it being real.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-12">
                            {/* WITHOUT Diagram */}
                            <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-2xl relative">
                                <span className="absolute -top-3 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">WITHOUT GHOSTJOB</span>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-48 p-4 bg-bg-card border border-gray-800 rounded-lg text-center">
                                        <div className="text-xs text-text-secondary mb-1">🏢 Company</div>
                                        <div className="font-bold">Knows if real ✅</div>
                                    </div>
                                    <div className="text-2xl">↓</div>
                                    <div className="w-48 p-4 bg-bg-card border-2 border-dashed border-gray-700 rounded-lg text-center">
                                        <div className="text-xs text-text-secondary mb-1">📋 Job Posting</div>
                                        <div className="font-bold text-red-400">Real or Ghost? ❓</div>
                                    </div>
                                    <div className="text-2xl">↓</div>
                                    <div className="w-48 p-4 bg-bg-card border border-gray-800 rounded-lg text-center">
                                        <div className="text-xs text-text-secondary mb-1">👤 You</div>
                                        <div className="font-bold text-red-500">No idea ❌</div>
                                    </div>
                                </div>
                            </div>

                            {/* WITH Diagram */}
                            <div className="bg-success/5 border border-success/20 p-8 rounded-2xl relative">
                                <span className="absolute -top-3 left-6 bg-success text-white text-xs font-bold px-3 py-1 rounded">WITH GHOSTJOB</span>
                                <div className="flex flex-col items-center space-y-4">
                                    <div className="w-48 p-4 bg-bg-card border-2 border-dashed border-gray-700 rounded-lg text-center">
                                        <div className="text-xs text-text-secondary mb-1">📋 Job Posting</div>
                                        <div className="font-bold text-primary">Real or Ghost? ❓</div>
                                    </div>
                                    <div className="text-2xl">↓</div>
                                    <div className="w-48 p-4 bg-bg-card border border-primary rounded-lg text-center shadow-lg shadow-primary/20">
                                        <div className="text-xs text-text-secondary mb-1">👻 GhostJob AI</div>
                                        <div className="font-bold">Ghost Score: 73%</div>
                                        <div className="text-[10px] text-primary">&quot;Probably Ghost&quot;</div>
                                    </div>
                                    <div className="text-2xl">↓</div>
                                    <div className="w-48 p-4 bg-bg-card border border-gray-800 rounded-lg text-center">
                                        <div className="text-xs text-text-secondary mb-1">👤 You</div>
                                        <div className="font-bold text-success">Now you know! ✅</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 2 — Three Core Dimensions */}
                <section id="dimensions" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">We Analyze Three Core Dimensions</h2>
                        <p className="text-xl text-text-secondary">Each dimension examines a different aspect of the job description to build a complete picture.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Clarity Card */}
                        <div className="bg-bg-card border border-gray-800 rounded-3xl p-8 flex flex-col h-full">
                            <div className="text-6xl mb-6">📐</div>
                            <h3 className="text-2xl font-bold mb-4">Clarity — Is the job description specific?</h3>
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-text-secondary">Example Score</span>
                                    <span className="text-primary font-bold">90/100</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '90%' }}></div>
                                </div>
                            </div>
                            <p className="text-text-secondary mb-6 flex-grow">
                                The Clarity score measures how specific and well-defined the job description is.
                            </p>
                            <ul className="space-y-3 text-sm mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Are responsibilities concrete?</strong><br />&quot;Build data pipelines using AWS Glue&quot; vs &quot;Work on exciting projects&quot;</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Are requirements measurable?</strong><br />&quot;3-5 years with Python&quot; vs &quot;Strong experience&quot;</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Does seniority match expectations?</strong><br />Junior role asking for 8 years = confused posting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Is language direct or buzzwords?</strong><br />&quot;Leverage synergies&quot; = says nothing</span>
                                </li>
                            </ul>
                            <div className="pt-6 border-t border-gray-800 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
                                Based on: NLP readability analysis, Flesch-Kincaid Score, Plain Language principles
                            </div>
                        </div>

                        {/* Realism Card */}
                        <div className="bg-bg-card border border-gray-800 rounded-3xl p-8 flex flex-col h-full">
                            <div className="text-6xl mb-6">🎯</div>
                            <h3 className="text-2xl font-bold mb-4">Realism — Are the requirements possible?</h3>
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-text-secondary">Example Score</span>
                                    <span className="text-primary font-bold">95/100</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '95%' }}></div>
                                </div>
                            </div>
                            <p className="text-text-secondary mb-6 flex-grow">
                                The Realism score checks whether what the company is asking for exists in the real world.
                            </p>
                            <ul className="space-y-3 text-sm mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Years vs technology age</strong><br />&quot;10 years SwiftUI&quot; — SwiftUI released 2019</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Skills vs role scope</strong><br />&quot;Full-stack + DevOps + Design + PM + Data&quot; = 5 people for 1</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Salary vs market vs seniority</strong><br />&quot;Senior Engineer, $35k, San Francisco&quot;</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Contradictory requirements</strong><br />&quot;Entry-level, 5+ years required&quot; — pick one</span>
                                </li>
                            </ul>
                            <div className="pt-6 border-t border-gray-800 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
                                Based on: Labor market data, Credential Inflation research (Fuller & Raman, Harvard, 2017)
                            </div>
                        </div>

                        {/* Transparency Card */}
                        <div className="bg-bg-card border border-gray-800 rounded-3xl p-8 flex flex-col h-full">
                            <div className="text-6xl mb-6">🔍</div>
                            <h3 className="text-2xl font-bold mb-4">Transparency — What is the company hiding?</h3>
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-text-secondary">Example Score</span>
                                    <span className="text-primary font-bold">80/100</span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary" style={{ width: '80%' }}></div>
                                </div>
                            </div>
                            <p className="text-text-secondary mb-6 flex-grow">
                                The Transparency score measures how open the company is about important information.
                            </p>
                            <ul className="space-y-3 text-sm mb-8">
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Is salary mentioned?</strong><br />&quot;Competitive salary&quot; is not a salary</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Is the company named?</strong><br />&quot;Confidential client&quot; — what else?</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Is team described?</strong><br />&quot;Join our amazing team&quot; — what team?</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-success text-base">✅</span>
                                    <span><strong>Work model clear?</strong><br />&quot;Flexible&quot; = probably 5 days office</span>
                                </li>
                            </ul>
                            <div className="pt-6 border-t border-gray-800 text-[10px] text-text-secondary uppercase tracking-widest font-bold">
                                Based on: Information Asymmetry Theory (Akerlof, 1970), Pay Transparency legislation
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 3 — 15+ Red Flag Signals */}
                <section id="red-flags" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">The Signals We Look For</h2>
                        <p className="text-xl text-text-secondary">Each job description is scanned for 15+ signals, each weighted by severity.</p>
                    </div>

                    <div className="space-y-12">
                        {/* High Severity */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-danger"></span> High Severity (+15-20 points each)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {["Impossible Requirements", "Chronic Reposting", "Contradictory Requirements", "Unicorn Job"].map((signal, i) => (
                                    <div key={i} className="p-6 bg-bg-card border-l-4 border-danger rounded-r-xl">
                                        <div className="font-bold mb-2">{signal}</div>
                                        <div className="text-xs text-text-secondary">
                                            {i === 0 ? "More years than the tech exists" :
                                                i === 1 ? "Same job posted 6+ months" :
                                                    i === 2 ? "Entry-level + senior experience" :
                                                        "One role, 5+ completely different fields"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medium Severity */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-warning"></span> Medium Severity (+8-12 points each)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {["No Salary Info", "Anonymous Employer", "Vague Language", "Copy-Paste Text", "No Team Info", "Evergreen Posting", "Excessive Openings"].map((signal, i) => (
                                    <div key={i} className="p-6 bg-bg-card border-l-4 border-warning rounded-r-xl">
                                        <div className="font-bold text-sm mb-1">{signal}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Low Severity */}
                        <div>
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-gray-500"></span> Low Severity (+3-5 points each)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {["No Benefits", "'Competitive Salary'", "No Process Described", "Buzzword Overload", "Vague Company", "No Location Clarity"].map((signal, i) => (
                                    <div key={i} className="p-6 bg-bg-card border-l-4 border-gray-600 rounded-r-xl">
                                        <div className="font-bold text-sm mb-1">{signal}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SECTION 4 — Green Flags */}
                <section id="green-flags" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">What Makes a Job Look Legit</h2>
                        <p className="text-xl text-text-secondary">These positive signals reduce the Ghost Score.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: "Specific Salary Range", points: "-15" },
                            { title: "Detailed Tech Stack", points: "-12" },
                            { title: "Clear Responsibilities", points: "-10" },
                            { title: "Named Hiring Manager", points: "-10" },
                            { title: "Team Description", points: "-8" },
                            { title: "Realistic Requirements", points: "-8" },
                            { title: "Specific Benefits", points: "-5" },
                            { title: "Hiring Process Explained", points: "-5" },
                            { title: "Detailed Company Intro", points: "-5" },
                        ].map((flag, i) => (
                            <div key={i} className="p-6 bg-bg-card border-l-4 border-success rounded-r-xl flex justify-between items-center">
                                <div className="font-bold">{flag.title}</div>
                                <div className="text-success font-bold text-sm">{flag.points} pts</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 5 — The Ghost Score */}
                <section id="ghost-score" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-8">Putting It All Together: The Ghost Score</h2>

                        {/* Visual scale bar */}
                        <div className="max-w-3xl mx-auto mb-16 relative pt-10">
                            <div className="h-6 w-full flex rounded-full overflow-hidden border border-gray-800">
                                <div className="h-full bg-success flex-1 border-r border-bg-primary"></div>
                                <div className="h-full bg-warning flex-1 border-r border-bg-primary"></div>
                                <div className="h-full bg-orange-500 flex-1 border-r border-bg-primary"></div>
                                <div className="h-full bg-danger flex-1"></div>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold mt-4 px-2 text-text-secondary">
                                <div className="text-center">0<br /><span className="text-success">✅ Legit</span></div>
                                <div className="text-center">30<br /><span className="text-warning">🤔 Sus</span></div>
                                <div className="text-center">60<br /><span className="text-orange-500">👻 Ghost</span></div>
                                <div className="text-center">85<br /><span className="text-danger">💀 Certified</span></div>
                                <div className="text-center">100</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="p-8 bg-bg-card rounded-2xl border border-success/20">
                                <h3 className="text-2xl font-bold text-success mb-4">✅ Looks Legit (0-30)</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    Few or no red flags. Apply with confidence, but always do your own research too.
                                </p>
                            </div>
                            <div className="p-8 bg-bg-card rounded-2xl border border-warning/20">
                                <h3 className="text-2xl font-bold text-warning mb-4">🤔 Kinda Sus (31-60)</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    Some concerning signals. Proceed with caution. Verify the company through other channels.
                                </p>
                            </div>
                            <div className="p-8 bg-bg-card rounded-2xl border border-orange-500/20">
                                <h3 className="text-2xl font-bold text-orange-500 mb-4">👻 Probably Ghost (61-85)</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    Multiple red flags. Consider skipping this one and focusing on better opportunities.
                                </p>
                            </div>
                            <div className="p-8 bg-bg-card rounded-2xl border border-danger/20">
                                <h3 className="text-2xl font-bold text-danger mb-4">💀 Certified Ghost (86-100)</h3>
                                <p className="text-text-secondary leading-relaxed">
                                    Overwhelming evidence. Do not waste your time. Share it on the Ghost Wall to warn others.
                                </p>
                            </div>
                        </div>

                        <p className="mt-12 text-sm text-text-secondary italic max-w-2xl mx-auto">
                            &quot;The Ghost Score is a probability, not a certainty. Like a spam filter, it catches patterns — but no algorithm is 100% accurate. We optimize for catching ghost jobs even at the cost of occasional false positives, because your time is too valuable to waste.&quot;
                        </p>
                    </div>
                </section>

                {/* SECTION 6 — Academic Foundation */}
                <section id="research" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Standing on the Shoulders of Giants</h2>
                        <p className="text-xl text-text-secondary">GhostJob is built on established economic and sociological research.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: "Signal Detection Theory", author: "Green & Swets (1966)", content: "Originally for radar operators detecting enemy aircraft. We apply the same framework: distinguishing real jobs (signal) from ghost jobs (noise)." },
                            { title: "The Market for Lemons", author: "Akerlof (1970, Nobel 2001)", content: "When buyers can't assess quality, bad products drive out good ones. Ghost jobs pollute the market for real opportunities." },
                            { title: "Job Market Signaling", author: "Spence (1973, Nobel 2001)", content: "Spence showed participants send signals to convey quality. We read the employer's signals to assess posting legitimacy." },
                            { title: "Dismissed by Degrees", author: "Fuller & Raman (Harvard, 2017)", content: "This study showed employers routinely inflate requirements beyond what's needed. We use this to calibrate our Realism score." },
                        ].map((ref, i) => (
                            <div key={i} className="p-8 bg-bg-card border border-gray-800 rounded-2xl group hover:border-primary/50 transition">
                                <div className="text-3xl mb-4">📖</div>
                                <h3 className="text-xl font-bold mb-2">{ref.title}</h3>
                                <div className="text-sm text-primary mb-4 font-semibold">{ref.author}</div>
                                <p className="text-text-secondary text-sm leading-relaxed">{ref.content}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* SECTION 7 — Data Sources */}
                <section id="data" className="mb-32 scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">The Data Behind Our Claims</h2>
                    </div>

                    <div className="bg-bg-card rounded-2xl border border-gray-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-800 bg-bg-primary">
                                    <tr>
                                        <th className="px-8 py-6 font-bold">Claim</th>
                                        <th className="px-8 py-6 font-bold">Source</th>
                                        <th className="px-8 py-6 font-bold">Year</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {[
                                        { claim: "43% of jobs are ghost jobs", source: "Clarify Capital Survey", year: "2022" },
                                        { claim: "11 hrs/week job searching", source: "Bureau of Labor Statistics", year: "2023" },
                                        { claim: "2-3% application response rate", source: "Jobvite Recruiter Nation", year: "2022" },
                                        { claim: "75% more likely to pass ATS", source: "TopResume Study", year: "2021" },
                                        { claim: "Companies post for 'optics'", source: "Resume Builder Survey", year: "2023" },
                                        { claim: "60%+ credential inflation", source: "Harvard Business School", year: "2017" },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-bg-primary/50 transition">
                                            <td className="px-8 py-6 text-text-primary">{row.claim}</td>
                                            <td className="px-8 py-6 text-text-secondary">{row.source}</td>
                                            <td className="px-8 py-6 text-text-secondary">{row.year}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>

                {/* SECTION 8 — CTA */}
                <section>
                    <div className="bg-gradient-to-br from-primary/20 to-bg-card p-12 md:p-20 rounded-3xl border border-primary/30 text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black mb-8">Enough Theory. Let&apos;s Check Your Job.</h2>
                            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
                                Now that you know how it works, try it yourself and stop wasting time on fake postings.
                            </p>
                            <Link
                                href="/analyze"
                                className="inline-block px-12 py-5 text-xl gradient-purple rounded-xl font-bold hover:opacity-90 transition transform hover:scale-105 shadow-xl"
                            >
                                Analyze a Job Posting — Free 👻
                            </Link>
                            <p className="text-sm text-text-secondary mt-6">
                                No signup required
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
