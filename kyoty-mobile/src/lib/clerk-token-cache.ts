import * as SecureStore from 'expo-secure-store';

/**
 * Token cache adapter for Clerk Expo SDK.
 * Stores tokens in the device's secure enclave.
 */
export const tokenCache = {
    async getToken(key: string): Promise<string | undefined | null> {
        try {
            return SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },
    async saveToken(key: string, value: string): Promise<void> {
        try {
            await SecureStore.setItemAsync(key, value);
        } catch {
            // Swallow — secure store may not be available on web/simulator
        }
    },
    async clearToken(key: string): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(key);
        } catch {
            // Swallow
        }
    },
};
