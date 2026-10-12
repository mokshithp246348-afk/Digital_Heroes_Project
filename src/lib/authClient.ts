/**
 * Client-Side Authenticated API Client with Silent 401 Refresh & Auto-Retry
 */

export interface AuthenticatedFetchOptions extends RequestInit {
  retryOn401?: boolean;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Triggers a silent refresh of the user session cookie/token via /api/auth/session
 */
export async function silentSessionRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      console.log('[AuthClient] Initiating silent session token refresh...');
      const res = await fetch('/api/auth/session', {
        method: 'GET',
        headers: { 'Cache-Control': 'no-cache' },
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success && data.user) {
        console.log('[AuthClient] Silent session refresh succeeded for:', data.user.email);
        return true;
      }
      console.warn('[AuthClient] Silent session refresh returned unauthenticated:', data);
      return false;
    } catch (err) {
      console.error('[AuthClient Error] Silent session refresh failed:', err);
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Enhanced Fetch Wrapper for Protected API Endpoints
 * - Automatically attaches credentials: 'include'
 * - Reads fresh session headers
 * - Handles 401 Unauthorized with 1 silent refresh + retry
 * - Redirects cleanly to login with returnUrl on final failure
 */
export async function authenticatedFetch(
  url: string,
  options: AuthenticatedFetchOptions = {}
): Promise<Response> {
  const { retryOn401 = true, headers: customHeaders, ...restOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const fetchOptions: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include', // Ensure cookies are always transmitted
  };

  try {
    let response = await fetch(url, fetchOptions);

    // If 401 Unauthorized and retry is enabled, attempt 1 silent refresh
    if (response.status === 401 && retryOn401) {
      console.warn(`[AuthClient] Received 401 Unauthorized for ${url}. Attempting silent refresh...`);
      const refreshed = await silentSessionRefresh();

      if (refreshed) {
        console.log(`[AuthClient] Silent refresh successful. Retrying original request to ${url}...`);
        response = await fetch(url, { ...fetchOptions, cache: 'no-store' });
      } else {
        console.error(`[AuthClient Error] Silent refresh failed for ${url}. Redirecting to login.`);
        handleAuthRedirect();
      }
    }

    return response;
  } catch (err: any) {
    console.error(`[AuthClient Fetch Error] Request to ${url} failed:`, err?.message || err);
    throw err;
  }
}

/**
 * Cleanly redirects to login with returnUrl on persistent session failure
 */
export function handleAuthRedirect() {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;
  if (currentPath.startsWith('/admin')) {
    if (currentPath !== '/admin/login') {
      window.location.href = `/admin/login?returnUrl=${encodeURIComponent(currentPath)}`;
    }
  } else if (currentPath !== '/login' && currentPath !== '/') {
    window.location.href = `/login?returnUrl=${encodeURIComponent(currentPath)}`;
  }
}
