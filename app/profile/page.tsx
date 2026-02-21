import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileManager from '@/components/ProfileManager';

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        redirect('/login');
    }

    // Fetch user profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    return (
        <div className="min-h-screen">
            {/* Navigation */}
            <nav className="border-b border-gray-800 bg-bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <span className="text-3xl">👻</span>
                        <span className="text-xl font-bold">GhostJob</span>
                    </Link>
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="text-text-secondary hover:text-white transition">
                            Dashboard
                        </Link>
                        <div className="text-text-secondary">{user.email}</div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-6 py-12 max-w-4xl">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
                    <p className="text-text-secondary">Upload your CV to automatically populate your profile for personalized cover letters and CVs.</p>
                </div>

                {/* Client component for uploading and managing profile data */}
                <ProfileManager initialProfile={profile} />
            </div>
        </div>
    );
}
