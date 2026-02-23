import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        // In Next.js 14+, we can't set cookies in Server Components 
                        // during the render phase. This is usually handled by middleware.
                        cookieStore.set({ name, value, ...options });
                    } catch (error) {
                        // Silently fail if we can't set cookies (expected in Server Components)
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch (error) {
                        // Silently fail if we can't delete cookies
                    }
                },
            },
        }
    );
}
