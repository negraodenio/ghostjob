import Link from 'next/link';

export default function PlaceholderPage({
    title,
    description,
    emoji
}: {
    title: string;
    description: string;
    emoji: string;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="text-center max-w-2xl">
                <div className="text-9xl mb-8">{emoji}</div>
                <h1 className="text-5xl font-bold mb-4">{title}</h1>
                <p className="text-xl text-text-secondary mb-8">{description}</p>
                <div className="flex justify-center space-x-4">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-bg-card border border-gray-700 rounded-lg font-semibold hover:border-primary transition"
                    >
                        ← Back to Home
                    </Link>
                    <Link
                        href="/analyze"
                        className="px-8 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition"
                    >
                        Analyze a Job
                    </Link>
                </div>
            </div>
        </div>
    );
}
