'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const router = useRouter();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                });
                if (signUpError) throw signUpError;
                setError('Check your email for the confirmation link');
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (signInError) throw signInError;
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-600 flex items-center justify-center mb-4 shadow-lg">
                        <span className="text-white font-extrabold text-xl">K</span>
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900">Welcome to Kyoty</h1>
                    <p className="text-neutral-500 text-sm mt-2">
                        {isSignUp ? 'Create an account to join the community' : 'Sign in to discover communities and events in your city'}
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="name@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className={`p-3 rounded-lg text-sm ${error.includes('Check your email') ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
