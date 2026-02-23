'use client';

import Link from "next/link";
import NotificationCenter from "./NotificationCenter";
import { useEffect, useState } from "react";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'border-b border-gray-800 bg-bg-card/80 backdrop-blur-md py-3' : 'bg-transparent py-5'
            }`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center space-x-8">
                    <Link href="/" className="flex items-center space-x-2 group">
                        <span className="text-3xl group-hover:rotate-12 transition-transform">👻</span>
                        <span className="text-xl font-bold tracking-tight">GhostJob</span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <Link href="/reports" className="text-primary font-bold hover:text-primary-light transition flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
                            </span>
                            Market Reports
                        </Link>
                        <Link href="/rankings" className="text-text-secondary hover:text-text-primary transition font-medium text-sm">Rankings</Link>
                        <Link href="/ghost-wall" className="text-text-secondary hover:text-text-primary transition font-medium text-sm">Ghost Wall</Link>
                        <Link href="/methodology" className="text-text-secondary hover:text-text-primary transition font-medium text-sm">Methodology</Link>
                        <Link href="/pricing" className="text-text-secondary hover:text-text-primary transition font-medium text-sm">Pricing</Link>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <NotificationCenter />
                    <Link href="/login" className="text-text-secondary hover:text-text-primary transition text-sm font-medium">Login</Link>
                    <Link href="/analyze" className="px-5 py-2 gradient-purple rounded-lg text-sm font-bold hover:opacity-90 transition shadow-lg shadow-primary/20">
                        Try Free
                    </Link>
                </div>
            </div>
        </nav>
    );
}
