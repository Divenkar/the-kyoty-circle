'use client';

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';

// This page handles the OAuth redirect from Clerk after Google sign-in.
// Clerk calls this URL automatically as the redirectUrl in authenticateWithRedirect().
export default function SSOCallbackPage() {
    return <AuthenticateWithRedirectCallback />;
}
