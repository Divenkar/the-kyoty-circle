import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type User = {
    id: number;
    email: string;
    name: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    session: any | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ error: string | null }>;
    register: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isLoading: true,
    login: async () => ({ error: 'Not initialized' }),
    register: async () => ({ error: 'Not initialized' }),
    logout: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const hydrateSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session) {
                    setSession(session);
                    fetchUserDetails(session.user.id);
                } else {
                    setIsLoading(false);
                }
            } catch (e) {
                console.log('Error hydrating session', e);
                setIsLoading(false);
            }
        };

        hydrateSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchUserDetails(session.user.id);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserDetails = async (authId: string) => {
        try {
            const { data, error } = await supabase
                .from('kyoty_users')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (data) {
                setUser(data as User);
            }
        } catch (e) {
            console.error('Error fetching user profile', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };
            return { error: null };
        } catch (e: any) {
            return { error: e.message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) return { error: error.message };

            if (data?.user) {
                const { error: profileError } = await supabase
                    .from('kyoty_users')
                    .insert({
                        auth_id: data.user.id,
                        email,
                        name,
                        role: 'participant',
                    });

                if (profileError) {
                    console.error('Failed to create profile record', profileError);
                }
            }

            return { error: null };
        } catch (e: any) {
            return { error: e.message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
