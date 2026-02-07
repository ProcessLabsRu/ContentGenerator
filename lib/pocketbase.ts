import PocketBase from 'pocketbase';

// Singleton instance of PocketBase client
let pb: PocketBase | null = null;

/**
 * Get PocketBase client instance
 * Creates a singleton instance that persists across requests
 */
export function getPocketBase(): PocketBase {
    if (!pb) {
        let url = process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL;

        if (!url) {
            throw new Error(
                'POCKETBASE_URL is not defined in environment variables. ' +
                'Please add it to your .env.local file.'
            );
        }

        // Удаляем /_/ из URL если он там есть (это только для Admin UI)
        url = url.replace(/\/_\/?$/, '');

        // Убираем trailing slash
        url = url.replace(/\/$/, '');

        pb = new PocketBase(url);

        // Enable auto cancellation for duplicate requests
        pb.autoCancellation(false);
    }

    return pb;
}

/**
 * Initialize PocketBase client for client-side usage
 * This should be called in client components
 */
export function initPocketBase(): PocketBase {
    let url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';

    // Удаляем /_/ из URL если он там есть
    url = url.replace(/\/_\/?$/, '');
    url = url.replace(/\/$/, '');

    const client = new PocketBase(url);
    client.autoCancellation(false);
    return client;
}

/**
 * Check if PocketBase is configured
 */
export function isPocketBaseConfigured(): boolean {
    return !!(process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL);
}

/**
 * Get PocketBase URL
 */
export function getPocketBaseUrl(): string {
    return process.env.POCKETBASE_URL || process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
}

/**
 * Create an authenticated PocketBase client from a cookie string
 */
export function createAuthenticatedPocketBase(cookieStr: string): PocketBase {
    const url = getPocketBaseUrl();
    const client = new PocketBase(url);
    client.autoCancellation(false);
    client.authStore.loadFromCookie(cookieStr);
    return client;
}

export default getPocketBase;
