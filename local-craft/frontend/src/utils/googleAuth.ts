import authApi from '../api/authApi';
import type { AuthResponse } from '../types/user.type';

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

interface GoogleTokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface GoogleErrorResponse {
  type?: string;
  message?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
            error_callback?: (error: GoogleErrorResponse) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

let scriptLoadPromise: Promise<void> | null = null;

/**
 * Loads the Google Identity Services script once and caches the load promise.
 */
export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google Sign-In chỉ khả dụng trên trình duyệt'));
  }
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => {
        scriptLoadPromise = null;
        reject(new Error('Không thể tải dịch vụ đăng nhập Google'));
      }, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = GIS_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadPromise = null;
      reject(new Error('Không thể kết nối tới Google Identity Services'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Opens Google's OAuth account chooser popup and returns a verified access token.
 */
export async function requestGoogleAccessToken(clientId: string): Promise<string> {
  if (!clientId) {
    throw new Error('Thiếu cấu hình VITE_GOOGLE_CLIENT_ID');
  }

  await loadGoogleIdentityScript();
  const oauth2 = window.google?.accounts?.oauth2;
  if (!oauth2) {
    throw new Error('Dịch vụ đăng nhập Google chưa sẵn sàng, vui lòng thử lại');
  }

  return new Promise<string>((resolve, reject) => {
    const client = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.error || !response.access_token) {
          reject(new Error(response.error_description || 'Đăng nhập Google không thành công'));
          return;
        }
        resolve(response.access_token);
      },
      error_callback: (err) => {
        if (err.type === 'popup_closed') {
          reject(new Error('Bạn đã đóng cửa sổ đăng nhập Google'));
          return;
        }
        if (err.type === 'popup_failed_to_open') {
          reject(new Error('Trình duyệt đang chặn cửa sổ bật lên (popup) của Google'));
          return;
        }
        reject(new Error(err.message || 'Không thể mở cửa sổ đăng nhập Google'));
      },
    });

    client.requestAccessToken({ prompt: 'select_account' });
  });
}

/**
 * Runs the full Google OAuth popup flow and exchanges the Google token for a CraftLocal session.
 */
export async function authenticateWithGoogle(role?: 'TOURIST' | 'HOST'): Promise<AuthResponse> {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const accessToken = await requestGoogleAccessToken(clientId);
  const res = await authApi.googleLogin({ accessToken, role });
  const payload = res.data?.data;
  if (!payload?.token || !payload?.user) {
    throw new Error('Không nhận được thông tin phiên đăng nhập từ máy chủ');
  }
  return payload;
}
