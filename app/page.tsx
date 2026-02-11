import Link from "next/link";

export default function HomePage() {
    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm fixed w-full z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#how-it-works" className="text-text-secondary hover:text-text-primary transition">How It Works</a>
                        <a href="#features" className="text-text-secondary hover:text-text-primary transition">Features</a>
                        <a href="#pricing" className="text-text-secondary hover:text-text-primary transition">Pricing</a>
                        <Link href="/ghost-wall" className="text-text-secondary hover:text-text-primary transition">Ghost Wall</Link>
                    </div>
                    <div className="flex space-x-4">
                        <Link href="/login" className="text-text-secondary hover:text-text-primary transition">Login</Link>
                        <Link href="/analyze" className="px-6 py-2 gradient-purple rounded-lg font-semibold hover:opacity-90 transition">
                            Try Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="ghost-float absolute top-20 left-10 text-6xl">👻</div>
                    <div className="ghost-float absolute top-40 right-20 text-4xl" style={{ animationDelay: '1s' }}>👻</div>
                    <div className="ghost-float absolute bottom-20 left-1/3 text-5xl" style={{ animationDelay: '2s' }}>👻</div>
                </div>

                <div className="container mx-auto max-w-5xl text-center relative z-10">
                    <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
                        Stop Applying to <span className="text-primary">Ghost Jobs</span>.
                        <br />
                        Start Landing Real Ones.
                    </h1>
                    <p className="text-xl md:text-2xl text-text-secondary mb-10 max-w-3xl mx-auto">
                        You spend hours tailoring your CV, writing cover letters, and preparing for interviews — only to never hear back.
                        What if the job was never real?
                    </p>
                    <div className="mb-6">
                        <Link
                            href="/analyze"
                            className="inline-block px-10 py-4 text-lg gradient-purple rounded-lg font-bold hover:opacity-90 transition transform hover:scale-105"
                        >
                            Analyze a Job Posting — Free 👻
                        </Link>
                    </div>
                    <p className="text-sm text-text-secondary">
                        No signup required • Free forever for 3 checks/month
                    </p>
                </div>
            </section>

            {/* Section 2: Sound Familiar? (Pain Points) */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-16">Sound Familiar?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-gradient-to-br from-red-900/20 to-bg-card p-8 rounded-xl border border-red-900/30">
                            <div className="text-6xl mb-4 text-center">😤</div>
                            <p className="text-lg text-center">
                                Applied to 50+ jobs this month. Got 2 responses.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/20 to-bg-card p-8 rounded-xl border border-red-900/30">
                            <div className="text-6xl mb-4 text-center">😩</div>
                            <p className="text-lg text-center">
                                Spent 3 hours customizing my CV for a role that was posted 4 months ago.
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-900/20 to-bg-card p-8 rounded-xl border border-red-900/30">
                            <div className="text-6xl mb-4 text-center">😡</div>
                            <p className="text-lg text-center">
                                The listing asked for 10 years of experience in a 5-year-old technology.
                            </p>
                        </div>
                    </div>
                    <div className="text-center max-w-2xl mx-auto">
                        <p className="text-3xl font-bold mb-3">It&apos;s not you. It&apos;s ghost jobs.</p>
                        <p className="text-2xl text-primary mb-2">43% of online job postings aren&apos;t real.</p>
                        <p className="text-sm text-text-secondary">— Clarify Capital Research, 2022</p>
                    </div>
                </div>
            </section>

            {/* Section 3: What is a Ghost Job? (Education) */}
            <section className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-8">What is a Ghost Job? 👻</h2>
                    <p className="text-xl text-center text-text-secondary mb-12 max-w-3xl mx-auto">
                        Ghost jobs are positions that companies post online with no intention of actually hiring anyone. They exist because...
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold mb-3">Legal Compliance</h3>
                            <p className="text-text-secondary">
                                HR needs to prove they tried to fill the role externally before giving it to an internal candidate.
                            </p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800">
                            <div className="text-5xl mb-4">🏦</div>
                            <h3 className="text-2xl font-bold mb-3">Talent Hoarding</h3>
                            <p className="text-text-secondary">
                                Companies collect resumes for future openings that may never come. Your CV sits in a database forever.
                            </p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800">
                            <div className="text-5xl mb-4">📈</div>
                            <h3 className="text-2xl font-bold mb-3">Growth Optics</h3>
                            <p className="text-text-secondary">
                                Posting jobs makes the company look like it&apos;s growing — great for investors, terrible for you.
                            </p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800">
                            <div className="text-5xl mb-4">👤</div>
                            <h3 className="text-2xl font-bold mb-3">Already Filled</h3>
                            <p className="text-text-secondary">
                                The internal candidate was chosen before the job was even posted. The listing is just a formality.
                            </p>
                        </div>
                    </div>
                    <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary/20 to-bg-card p-8 rounded-xl border-2 border-primary/50">
                        <p className="text-2xl text-center font-bold">
                            The average job seeker wastes 5.5 hours per week applying to jobs that don&apos;t exist.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 4: Before vs After */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-16">Apply Smarter. Not Harder.</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Without GhostJob */}
                        <div className="bg-gradient-to-br from-red-900/10 to-bg-card p-8 rounded-xl border-2 border-red-900/30">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <span className="mr-2">❌</span> Without GhostJob
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>Find job → Apply → Hope → Silence → Repeat</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>11 hours/week searching blindly</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>2-3% application response rate</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>No idea which jobs are real</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>Same generic CV for every application</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-red-500 mr-3 mt-1">❌</span>
                                    <span>Ghosted by ghost jobs</span>
                                </li>
                            </ul>
                        </div>

                        {/* With GhostJob */}
                        <div className="bg-gradient-to-br from-primary/10 to-bg-card p-8 rounded-xl border-2 border-primary/50">
                            <h3 className="text-2xl font-bold mb-6 flex items-center">
                                <span className="mr-2">✅</span> With GhostJob
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>Find job → Ghost Check → Tailored CV → Ace Interview → Hired</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>5+ hours saved per week</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>Focus only on verified real opportunities</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>Know the ghost score before investing time</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>CV optimized for THAT specific job</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-3 mt-1">✅</span>
                                    <span>Interview prep for THAT specific role</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 6: How It Works */}
            <section id="how-it-works" className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-4">How It Works</h2>
                    <p className="text-xl text-center text-text-secondary mb-16 max-w-3xl mx-auto">
                        From any job board to interview-ready in minutes.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting line (desktop only) */}
                        <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-gray-800 via-primary/50 to-gray-800 -z-10"></div>

                        <div className="text-center bg-bg-primary md:bg-transparent p-6 md:p-0 rounded-xl md:rounded-none z-10">
                            <div className="w-24 h-24 mx-auto bg-bg-card border border-gray-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg relative">
                                🔍
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-bg-primary">01</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Find a Job Anywhere</h3>
                            <p className="text-text-secondary text-sm">LinkedIn, Indeed, Glassdoor — wherever you search.</p>
                        </div>

                        <div className="text-center bg-bg-primary md:bg-transparent p-6 md:p-0 rounded-xl md:rounded-none z-10">
                            <div className="w-24 h-24 mx-auto bg-bg-card border border-gray-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg relative">
                                📋
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-bg-primary">02</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Paste It Here</h3>
                            <p className="text-text-secondary text-sm">Copy the job description and paste it into GhostJob.</p>
                        </div>

                        <div className="text-center bg-bg-primary md:bg-transparent p-6 md:p-0 rounded-xl md:rounded-none z-10">
                            <div className="w-24 h-24 mx-auto bg-bg-card border border-gray-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg relative">
                                👻
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-bg-primary">03</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Get the Truth</h3>
                            <p className="text-text-secondary text-sm">AI analyzes 15+ signals and reveals the ghost score in seconds.</p>
                        </div>

                        <div className="text-center bg-bg-primary md:bg-transparent p-6 md:p-0 rounded-xl md:rounded-none z-10">
                            <div className="w-24 h-24 mx-auto bg-bg-card border border-gray-700 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg relative">
                                🚀
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white border-4 border-bg-primary">04</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Apply with Confidence</h3>
                            <p className="text-text-secondary text-sm">If it&apos;s real, get tailored CV, cover letter, and interview prep.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Features (Four Superpowers) */}
            <section id="features" className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-4">One Job Description. Four Superpowers.</h2>
                    <p className="text-xl text-center text-text-secondary mb-16 max-w-3xl mx-auto">
                        Paste a job description and get everything you need to land it.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800 hover:border-primary transition card-glow relative group">
                            <span className="absolute top-4 right-4 bg-green-500/20 text-green-500 text-xs font-bold px-2 py-1 rounded border border-green-500/30">FREE</span>
                            <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">👻</div>
                            <h3 className="text-2xl font-bold mb-3">Ghost Detector</h3>
                            <p className="text-text-secondary mb-4">Know if a job is real BEFORE you waste 2 hours applying. AI analyzes 15+ red flags in 5 seconds.</p>
                            <p className="text-xs text-text-secondary opacity-60">Checks impossible requirements, vague descriptions, missing salary, reposting patterns, and more.</p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800 hover:border-primary transition card-glow relative group">
                            <span className="absolute top-4 right-4 bg-purple-500/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/30">PRO</span>
                            <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">📄</div>
                            <h3 className="text-2xl font-bold mb-3">Smart CV Builder</h3>
                            <p className="text-text-secondary mb-4">ATS-optimized resume tailored to each specific job. Not a template — a weapon.</p>
                            <p className="text-xs text-text-secondary opacity-60">3 professional templates, keyword optimization, ATS compatibility score, PDF export.</p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800 hover:border-primary transition card-glow relative group">
                            <span className="absolute top-4 right-4 bg-purple-500/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/30">PRO</span>
                            <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">✉️</div>
                            <h3 className="text-2xl font-bold mb-3">Cover Letter Writer</h3>
                            <p className="text-text-secondary mb-4">Personalized, not &apos;Dear Hiring Manager&apos;. References the actual job requirements and your real experience.</p>
                            <p className="text-xs text-text-secondary opacity-60">3 tone options: Professional, Friendly, Bold. Download as PDF or copy to clipboard.</p>
                        </div>
                        <div className="bg-bg-primary p-8 rounded-xl border border-gray-800 hover:border-primary transition card-glow relative group">
                            <span className="absolute top-4 right-4 bg-purple-500/20 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/30">PRO</span>
                            <div className="text-5xl mb-4 group-hover:scale-110 transition duration-300">🎤</div>
                            <h3 className="text-2xl font-bold mb-3">Interview Prep</h3>
                            <p className="text-text-secondary mb-4">AI generates the exact questions they&apos;ll likely ask, then coaches you through mock interviews with real-time feedback.</p>
                            <p className="text-xs text-text-secondary opacity-60">12-15 targeted questions, mock interview chat, cheat sheet, STAR method coaching.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW Section 7: Science Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Science, Not Guesswork</h2>
                        <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                            Our AI analyzes every job description across three research-backed dimensions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Clarity Score */}
                        <div className="bg-bg-card p-8 rounded-2xl border border-gray-800 hover:border-primary/50 transition duration-300 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                            <div className="text-6xl mb-6 relative z-10">📐</div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Clarity Score</h3>
                            <p className="text-text-secondary mb-4 relative z-10">
                                Is the job description specific about responsibilities and requirements? Or is it full of vague buzzwords that say nothing?
                            </p>
                            <p className="text-sm text-text-secondary/60 mt-auto relative z-10">Based on NLP readability analysis</p>
                        </div>

                        {/* Realism Score */}
                        <div className="bg-bg-card p-8 rounded-2xl border border-gray-800 hover:border-primary/50 transition duration-300 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                            <div className="text-6xl mb-6 relative z-10">🎯</div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Realism Score</h3>
                            <p className="text-text-secondary mb-4 relative z-10">
                                Are the requirements actually possible? Do the years of experience match the technology&apos;s age? Is this one job or five?
                            </p>
                            <p className="text-sm text-text-secondary/60 mt-auto relative z-10">Based on labor market intelligence</p>
                        </div>

                        {/* Transparency Score */}
                        <div className="bg-bg-card p-8 rounded-2xl border border-gray-800 hover:border-primary/50 transition duration-300 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                            <div className="text-6xl mb-6 relative z-10">🔍</div>
                            <h3 className="text-2xl font-bold mb-4 relative z-10">Transparency Score</h3>
                            <p className="text-text-secondary mb-4 relative z-10">
                                Does the company reveal salary, team structure, and hiring process? Or are they hiding everything behind &apos;competitive benefits&apos;?
                            </p>
                            <p className="text-sm text-text-secondary/60 mt-auto relative z-10">Based on information asymmetry theory</p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-xl text-text-secondary mb-6 max-w-2xl mx-auto">
                            These three scores combine with 15+ additional signals to produce the Ghost Score — your probability radar for fake job postings.
                        </p>
                        <Link href="/methodology" className="inline-flex items-center text-primary font-bold text-lg hover:text-white transition">
                            Read our full methodology <span className="ml-2">→</span>
                        </Link>
                        <div className="mt-8 pt-8 border-t border-gray-900 text-xs text-text-secondary/40 space-x-2">
                            <span>Informed by: Signal Detection Theory (Green & Swets, 1966)</span>
                            <span>•</span>
                            <span>Information Asymmetry (Akerlof, 1970)</span>
                            <span>•</span>
                            <span>Credential Inflation (Fuller & Raman, Harvard 2017)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 8: Real Stats */}
            <section className="py-12 border-y border-gray-800 bg-bg-card">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">43%</div>
                            <div className="text-text-secondary">of job postings are ghost jobs</div>
                            <div className="text-xs text-text-secondary mt-1 opacity-60">Clarify Capital, 2022</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">11 hrs</div>
                            <div className="text-text-secondary">wasted per week searching</div>
                            <div className="text-xs text-text-secondary mt-1 opacity-60">Bureau of Labor Statistics</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-primary mb-2">75%</div>
                            <div className="text-text-secondary">more likely to pass ATS</div>
                            <div className="text-xs text-text-secondary mt-1 opacity-60">TopResume Study</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 9: Ghost Wall Preview */}
            <section id="ghost-wall" className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">The Ghost Wall 🔥</h2>
                        <p className="text-xl text-text-secondary">Real ghost jobs exposed by real job seekers. See the worst offenders.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {/* Sample Card 1 */}
                        <div className="bg-bg-primary rounded-xl border border-red-900/30 overflow-hidden hover:border-red-500/50 transition duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Senior Full-Stack Developer</h3>
                                        <p className="text-text-secondary text-sm">TechCorp Inc</p>
                                    </div>
                                    <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded">
                                        💀 Certified Ghost
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2 mb-6">
                                    <span className="text-3xl font-bold text-red-500">94%</span>
                                    <span className="text-sm text-text-secondary">Ghost Score</span>
                                </div>

                                <div className="bg-bg-card p-3 rounded-lg mb-4">
                                    <div className="text-xs font-bold text-red-400 mb-1 flex items-center">
                                        <span className="mr-1">🚩</span> TOP RED FLAG
                                    </div>
                                    <p className="text-sm">Requires 10 years React experience (React is 11 years old)</p>
                                </div>

                                <div className="flex justify-between items-center text-sm text-text-secondary border-t border-gray-800 pt-4 mt-4">
                                    <span>2 days ago</span>
                                    <span className="flex items-center text-orange-400">
                                        <span className="mr-1">🔥</span> 234 busted
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sample Card 2 */}
                        <div className="bg-bg-primary rounded-xl border border-orange-900/30 overflow-hidden hover:border-orange-500/50 transition duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Marketing Manager</h3>
                                        <p className="text-text-secondary text-sm">StartupXYZ</p>
                                    </div>
                                    <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2 py-1 rounded">
                                        👻 Probably Ghost
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2 mb-6">
                                    <span className="text-3xl font-bold text-orange-500">87%</span>
                                    <span className="text-sm text-text-secondary">Ghost Score</span>
                                </div>

                                <div className="bg-bg-card p-3 rounded-lg mb-4">
                                    <div className="text-xs font-bold text-orange-400 mb-1 flex items-center">
                                        <span className="mr-1">🚩</span> TOP RED FLAG
                                    </div>
                                    <p className="text-sm">Posted 6 months ago, reposted 8 times</p>
                                </div>

                                <div className="flex justify-between items-center text-sm text-text-secondary border-t border-gray-800 pt-4 mt-4">
                                    <span>5 days ago</span>
                                    <span className="flex items-center text-orange-400">
                                        <span className="mr-1">🔥</span> 156 busted
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sample Card 3 */}
                        <div className="bg-bg-primary rounded-xl border border-orange-900/30 overflow-hidden hover:border-orange-500/50 transition duration-300">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg">Data Analyst</h3>
                                        <p className="text-text-secondary text-sm">BigCo Solutions</p>
                                    </div>
                                    <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-2 py-1 rounded">
                                        👻 Probably Ghost
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2 mb-6">
                                    <span className="text-3xl font-bold text-orange-500">73%</span>
                                    <span className="text-sm text-text-secondary">Ghost Score</span>
                                </div>

                                <div className="bg-bg-card p-3 rounded-lg mb-4">
                                    <div className="text-xs font-bold text-orange-400 mb-1 flex items-center">
                                        <span className="mr-1">🚩</span> TOP RED FLAG
                                    </div>
                                    <p className="text-sm">Requires PhD + 5 years experience for entry-level salary</p>
                                </div>

                                <div className="flex justify-between items-center text-sm text-text-secondary border-t border-gray-800 pt-4 mt-4">
                                    <span>1 week ago</span>
                                    <span className="flex items-center text-orange-400">
                                        <span className="mr-1">🔥</span> 89 busted
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center">
                        <Link href="/ghost-wall" className="text-primary hover:text-white transition font-semibold flex items-center justify-center">
                            See the Full Ghost Wall <span className="ml-2">→</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Section 9: Pricing */}
            <section id="pricing" className="py-20 px-6">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-5xl font-bold text-center mb-4">Less Than a Coffee. More Than a Recruiter.</h2>
                    <p className="text-xl text-center text-text-secondary mb-16 max-w-3xl mx-auto">
                        The average job seeker wastes $660/month in time applying to ghost jobs. GhostJob costs less than Netflix.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free */}
                        <div className="bg-bg-card p-8 rounded-xl border border-gray-800 flex flex-col">
                            <h3 className="text-2xl font-bold mb-2">Free</h3>
                            <div className="text-sm text-text-secondary mb-4">For casual job seekers</div>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-text-secondary">/month</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span className="text-text-secondary">3 ghost checks per month</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span className="text-text-secondary">1 CV generation</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span className="text-text-secondary">Basic ghost score</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span className="text-text-secondary">5 interview questions</span>
                                </li>
                                <li className="flex items-start opacity-50">
                                    <span className="text-red-500 mr-2">✕</span>
                                    <span className="text-text-secondary">Cover letter generation</span>
                                </li>
                                <li className="flex items-start opacity-50">
                                    <span className="text-red-500 mr-2">✕</span>
                                    <span className="text-text-secondary">Full interview prep</span>
                                </li>
                                <li className="flex items-start opacity-50">
                                    <span className="text-red-500 mr-2">✕</span>
                                    <span className="text-text-secondary">ATS optimization score</span>
                                </li>
                            </ul>
                            <Link href="/signup" className="block text-center px-6 py-3 border border-gray-700 rounded-lg hover:border-primary transition mt-auto">
                                Get Started Free
                            </Link>
                        </div>

                        {/* Pro */}
                        <div className="bg-gradient-to-br from-primary/20 to-bg-card p-8 rounded-xl border-2 border-primary relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-primary/20">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 gradient-purple rounded-full text-sm font-bold shadow-lg">
                                MOST POPULAR
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pro</h3>
                            <div className="text-sm text-text-secondary mb-4">For active job seekers</div>
                            <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-text-secondary">/month</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Unlimited ghost checks</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Unlimited CV generations</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Unlimited cover letters</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Full interview prep (15 Qs)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Mock interview with AI</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>ATS optimization score</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>3 CV templates</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Interview cheat sheet</span>
                                </li>
                            </ul>
                            <Link href="/signup?plan=pro" className="block text-center px-6 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition mt-auto shadow-lg">
                                Start Pro — $9/mo
                            </Link>
                        </div>

                        {/* Premium */}
                        <div className="bg-bg-card p-8 rounded-xl border border-gray-800 flex flex-col">
                            <h3 className="text-2xl font-bold mb-2">Premium</h3>
                            <div className="text-sm text-text-secondary mb-4">For serious job hunters</div>
                            <div className="text-4xl font-bold mb-6">$19<span className="text-lg text-text-secondary">/month</span></div>
                            <ul className="space-y-3 mb-8 flex-grow">
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Everything in Pro, plus:</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>All CV templates</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Company deep research</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Salary negotiation guide</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Priority AI (faster)</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Ghost Wall verified badge</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-success mr-2">✓</span>
                                    <span>Export all formats</span>
                                </li>
                            </ul>
                            <Link href="/signup?plan=premium" className="block text-center px-6 py-3 border border-gray-700 rounded-lg hover:border-primary transition mt-auto">
                                Go Premium — $19/mo
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 10: FAQ */}
            <section className="py-20 px-6 bg-bg-card">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-5xl font-bold text-center mb-16">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <details className="group bg-bg-primary rounded-xl border border-gray-800 p-6 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-xl font-bold">
                                <h3 className="group-open:text-primary transition-colors">How accurate is the ghost detection?</h3>
                                <span className="shrink-0 rounded-full bg-white/10 p-1.5 text-white sm:p-3 group-open:bg-primary group-open:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-text-secondary">
                                Our AI analyzes 15+ signals in every job description — including impossible requirements, vague descriptions, missing salary information, and reposting patterns. It provides a probability score, like a spam filter for job postings. It&apos;s not 100% certain, but it catches the obvious fakes and flags suspicious patterns that humans often miss.
                            </p>
                        </details>

                        <details className="group bg-bg-primary rounded-xl border border-gray-800 p-6 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-xl font-bold">
                                <h3 className="group-open:text-primary transition-colors">I already have a resume builder. Why do I need this?</h3>
                                <span className="shrink-0 rounded-full bg-white/10 p-1.5 text-white sm:p-3 group-open:bg-primary group-open:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-text-secondary">
                                Resume builders help you create CVs. We help you decide IF you should create one. Why spend 2 hours crafting the perfect CV for a job that doesn&apos;t exist? GhostJob filters first, then builds. And our CV is tailored to THAT specific job description — not a generic template.
                            </p>
                        </details>

                        <details className="group bg-bg-primary rounded-xl border border-gray-800 p-6 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-xl font-bold">
                                <h3 className="group-open:text-primary transition-colors">Is my data safe?</h3>
                                <span className="shrink-0 rounded-full bg-white/10 p-1.5 text-white sm:p-3 group-open:bg-primary group-open:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-text-secondary">
                                Your data is encrypted and stored securely. We never share your information with employers or third parties. You own your data and can delete it anytime from your dashboard.
                            </p>
                        </details>

                        <details className="group bg-bg-primary rounded-xl border border-gray-800 p-6 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-xl font-bold">
                                <h3 className="group-open:text-primary transition-colors">Can I cancel anytime?</h3>
                                <span className="shrink-0 rounded-full bg-white/10 p-1.5 text-white sm:p-3 group-open:bg-primary group-open:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-text-secondary">
                                Yes. No contracts, no hidden fees, no cancellation hoops. Cancel with one click from your dashboard. You&apos;ll keep access until the end of your billing period.
                            </p>
                        </details>

                        <details className="group bg-bg-primary rounded-xl border border-gray-800 p-6 [&_summary::-webkit-details-marker]:hidden">
                            <summary className="flex cursor-pointer items-center justify-between gap-1.5 text-xl font-bold">
                                <h3 className="group-open:text-primary transition-colors">What makes this different from other job tools?</h3>
                                <span className="shrink-0 rounded-full bg-white/10 p-1.5 text-white sm:p-3 group-open:bg-primary group-open:text-white transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5 shrink-0 transition duration-300 group-open:-rotate-180" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </span>
                            </summary>
                            <p className="mt-4 leading-relaxed text-text-secondary">
                                Other tools start with your CV. We start with THE JOB. First we verify it&apos;s real, then we tailor everything specifically to that posting — CV, cover letter, and interview prep. Ghost detection + full application preparation in one flow. No one else does this.
                            </p>
                        </details>
                    </div>
                </div>
            </section>

            {/* Section 11: Final CTA */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="bg-gradient-to-br from-bg-card to-bg-primary p-12 rounded-3xl border border-primary/30 relative overflow-hidden text-center shadow-2xl shadow-primary/10">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black mb-6">
                                Every hour you spend on a ghost job is an hour you&apos;re NOT spending on the real one.
                            </h2>
                            <p className="text-xl text-text-secondary mb-10">
                                Stop guessing. Start knowing.
                            </p>
                            <Link
                                href="/analyze"
                                className="inline-block px-12 py-5 text-xl gradient-purple rounded-xl font-bold hover:opacity-90 transition transform hover:scale-105 shadow-xl"
                            >
                                Analyze Your First Job — Free 👻
                            </Link>
                            <p className="text-sm text-text-secondary mt-6">
                                No credit card required • Takes 30 seconds
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-gray-800 bg-bg-card">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex flex-col mb-4 md:mb-0">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="text-3xl">👻</span>
                                <span className="text-xl font-bold">GhostJob</span>
                            </div>
                            <p className="text-sm text-text-secondary max-w-xs">
                                The only AI tool that checks if a job is real before you apply. Stop wasting time on ghost jobs.
                            </p>
                        </div>
                        <div className="flex space-x-6 mb-4 md:mb-0">
                            <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition">Privacy Policy</Link>
                            <Link href="/terms" className="text-text-secondary hover:text-text-primary transition">Terms</Link>
                            <Link href="/methodology" className="text-text-secondary hover:text-text-primary transition">Methodology</Link>
                            <a href="mailto:hello@ghostjob.app" className="text-text-secondary hover:text-text-primary transition">Contact</a>
                        </div>
                        <div className="text-text-secondary text-sm">
                            &copy; {new Date().getFullYear()} GhostJob. Built with AI.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
