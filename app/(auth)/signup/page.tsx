'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const supabase = createClient();

            const { data, error: signupError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signupError) throw signupError;

            // Create profile
            if (data.user) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email,
                        full_name: fullName,
                        plan: 'free',
                    });

                if (profileError) {
                    console.error('Profile creation error:', profileError);
                }
            }

            // Redirect to a success page or ask them to check email
            router.push('/analyze?signup=success');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign up with Google');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center space-x-2 mb-6">
                        <span className="text-5xl">👻</span>
                        <span className="text-3xl font-bold">GhostJob</span>
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">Create your account</h1>
                    <p className="text-text-secondary">Start detecting ghost jobs for free</p>
                </div>

                <div className="bg-bg-card p-8 rounded-xl border border-gray-800">
                    {error && (
                        <div className="mb-6 p-4 bg-danger/10 border border-danger rounded-lg text-danger text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-bg-primary border border-gray-700 rounded-lg focus:outline-none focus:border-primary transition"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-text-secondary mt-1">At least 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full px-6 py-3 gradient-purple rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
                        >
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-gray-700"></div>
                        <span className="px-4 text-sm text-text-secondary">or</span>
                        <div className="flex-1 border-t border-gray-700"></div>
                    </div>

                    <button
                        onClick={handleGoogleSignup}
                        className="w-full px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center justify-center space-x-2"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <p className="text-center text-sm text-text-secondary mt-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline font-semibold">
                            Log in
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-text-secondary mt-6">
                    By signing up, you agree to our{' '}
                    <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
}
