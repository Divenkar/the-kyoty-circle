import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser } from '@clerk/clerk-expo';
import { createSupabaseClient } from '../lib/supabase';

type User = {
    id: number;
    email: string;
    name: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    isSignedIn: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isSignedIn: false,
    isLoading: true,
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { isSignedIn, isLoaded, signOut, getToken } = useClerkAuth();
    const { user: clerkUser } = useClerkUser();
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        if (!isSignedIn || !clerkUser) {
            setUser(null);
            setIsLoading(false);
            return;
        }

        try {
            const token = await getToken({ template: 'supabase' }).catch(() => null)
                ?? await getToken().catch(() => null);
            const supabase = createSupabaseClient(token);

            const { data } = await supabase
                .from('kyoty_users')
                .select('*')
                .eq('auth_id', clerkUser.id)
                .single();

            if (data) {
                setUser(data as User);
            } else {
                // User row may not exist yet (webhook race).
                // The web-side ensureUser() will create it on next server action.
                setUser({
                    id: 0,
                    email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
                    name: clerkUser.fullName ?? clerkUser.firstName ?? 'User',
                    role: 'participant',
                });
            }
        } catch (e) {
            console.error('Error fetching user profile', e);
        } finally {
            setIsLoading(false);
        }
    }, [isSignedIn, clerkUser, getToken]);

    useEffect(() => {
        if (isLoaded) {
            fetchUserProfile();
        }
    }, [isLoaded, isSignedIn, fetchUserProfile]);

    const logout = async () => {
        setIsLoading(true);
        await signOut();
        setUser(null);
        setIsLoading(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isSignedIn: isSignedIn ?? false,
            isLoading: !isLoaded || isLoading,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
