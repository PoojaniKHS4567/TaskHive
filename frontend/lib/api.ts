// frontend/lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];
let refreshTimer: NodeJS.Timeout | null = null;

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function refreshTokenRequest(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.ok;
  } catch (error) {
    return false;
  }
}

// ✅ NEW: Proactively refresh token before it expires
export function startTokenRefreshTimer() {
  // Refresh every 14 minutes (1 minute before 15 min expiry)
  if (refreshTimer) clearInterval(refreshTimer);
  
  refreshTimer = setInterval(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) {
        console.log('Token refresh failed, will retry later');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }, 14 * 60 * 1000); // 14 minutes
}

export function stopTokenRefreshTimer() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const makeRequest = async (): Promise<Response> => {
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  let response = await makeRequest();

  // If token expired (401), try to refresh
  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      const refreshed = await refreshTokenRequest();
      
      if (refreshed) {
        processQueue(null, 'refreshed');
        response = await makeRequest();
      } else {
        processQueue(new Error('Refresh failed'));
        stopTokenRefreshTimer();
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
      isRefreshing = false;
    } else {
      // Wait for refresh to complete
      await new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });
      response = await makeRequest();
    }
  }

  return response;
}