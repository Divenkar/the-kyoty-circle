import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { tokenCache } from './src/lib/clerk-token-cache';
import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!clerkPublishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables');
}

export default function App() {
    return (
        <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
            <ClerkLoaded>
                <SafeAreaProvider>
                    <AuthProvider>
                        <RootNavigator />
                    </AuthProvider>
                </SafeAreaProvider>
            </ClerkLoaded>
        </ClerkProvider>
    );
}
