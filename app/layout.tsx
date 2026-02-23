import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

// Force all pages to render dynamically — this app uses Supabase auth
// and cannot be statically prerendered without env variables
export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
    title: "GhostJob - Stop Applying to Ghost Jobs",
    description: "AI detects fake job postings, then crafts your perfect CV, cover letter, and interview prep — all from one job description.",
    keywords: ["ghost jobs", "job search", "AI resume", "CV builder", "cover letter"],
    icons: {
        icon: "/favicon.svg",
        apple: "/favicon.svg",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
            <body className={inter.className}>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
