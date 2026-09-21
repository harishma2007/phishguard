/**
 * PhishGuard API Client
 * Strictly uses relative URLs for all API calls:
 * /api/auth/register, /api/auth/login, /api/auth/me, /api/url/analyze
 */

const TOKEN_KEY = 'phishguard_auth_token';

export const tokenStorage = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {
      console.error('Failed to access localStorage:', e);
    }
  },
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error('Failed to remove token from localStorage:', e);
    }
  },
};

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerUser({ email, password, confirmPassword }) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed. Please try again.');
  }

  if (data.token) {
    tokenStorage.set(data.token);
  }

  return data;
}

/**
 * Login an existing user
 * POST /api/auth/login
 */
export async function loginUser({ email, password }) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed. Please check your credentials.');
  }

  if (data.token) {
    tokenStorage.set(data.token);
  }

  return data;
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getMe(token) {
  const authToken = token || tokenStorage.get();
  if (!authToken) {
    return null;
  }

  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    tokenStorage.remove();
    return null;
  }

  const data = await response.json();
  return data.user;
}

/**
 * Analyze URL for phishing indicators
 * POST /api/url/analyze
 */
export async function analyzeUrl(url, token) {
  const authToken = token || tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch('/api/url/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'URL analysis failed. Please verify the URL.');
  }

  return data;
}
