import { apiClient } from './client';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: 'STUDENT' | 'MENTOR' | 'TUTOR' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string | null;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

const TOKEN_HEADER = 'Authorization';
const COOKIE_NAME = 'em_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, matches JWT_EXPIRES_IN

function setSessionCookie(token: string) {
  // Always clear first to avoid duplicate cookies from a different path/attrs.
  clearSessionCookie();
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  // Expire any em_session cookie under root + current path.
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${COOKIE_NAME}=; max-age=0; SameSite=Lax`;
}

function readSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}

apiClient.interceptors.request.use((config) => {
  const token = readSessionCookie();
  if (token && !config.headers[TOKEN_HEADER]) {
    config.headers[TOKEN_HEADER] = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Drop any prior cookie so the request doesn't double-send (and so the
    // axios interceptor doesn't smuggle the OLD token into THIS login call).
    clearSessionCookie();
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/login',
      { email, password },
      { headers: { Authorization: '' } }, // explicitly suppress any leftover
    );
    setSessionCookie(data.accessToken);
    return data;
  },

  async register(input: { fullName: string; email: string; password: string }): Promise<AuthResponse> {
    clearSessionCookie();
    const { data } = await apiClient.post<AuthResponse>(
      '/auth/register',
      input,
      { headers: { Authorization: '' } },
    );
    setSessionCookie(data.accessToken);
    return data;
  },

  async me(): Promise<AuthUser> {
    const { data } = await apiClient.get<AuthUser>('/auth/me');
    return data;
  },

  logout() {
    clearSessionCookie();
  },
};
