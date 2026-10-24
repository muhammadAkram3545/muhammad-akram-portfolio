export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// In-memory token storage fallback for iframe environments where cookies might be restricted
let authToken: string | null = null;

export const setClientAuthToken = (token: string | null) => {
  authToken = token;
  try {
    if (token) {
      sessionStorage.setItem('studio_active_token', token);
    } else {
      sessionStorage.removeItem('studio_active_token');
    }
  } catch {}
};

export const getClientAuthToken = (): string | null => {
  if (authToken) return authToken;
  try {
    return sessionStorage.getItem('studio_active_token');
  } catch {
    return null;
  }
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getClientAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Sends studio_session cookie
    });

    if (response.status === 401) {
      // Broadcast session expired event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio-session-expired'));
      }
    }

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const responseData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMessage =
        (isJson && responseData.error) ||
        (isJson && responseData.message) ||
        `HTTP Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData as T;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    // Network or offline error
    throw new ApiError(
      error.message || 'Network connectivity error. Backend unreachable.',
      0,
      { isNetworkError: true }
    );
  }
}
