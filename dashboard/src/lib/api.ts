// Ephemeral session token for protected endpoints.
// Injected into index.html by the server — never fetched via API.
declare global {
  interface Window {
    __HERMES_SESSION_TOKEN__?: string;
    __HERMES_BASE_PATH__?: string;
    __HERMES_PLUGINS__?: {
      register: (name: string, component: unknown) => void;
      [key: string]: unknown;
    };
  }
}

function readBasePath(): string {
  if (typeof window === "undefined") return "";
  const raw = window.__HERMES_BASE_PATH__ ?? "";
  if (!raw) return "";
  const withLead = raw.startsWith("/") ? raw : `/${raw}`;
  return withLead.replace(/\/+$/, "");
}

export const HERMES_BASE_PATH = readBasePath();

export async function fetchJSON<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const headers = new Headers(init?.headers);
  const token = window.__HERMES_SESSION_TOKEN__;
  if (token) {
    headers.set("X-Hermes-Session-Token", token);
  }
  const res = await fetch(`${HERMES_BASE_PATH}${url}`, {
    ...init,
    headers,
    credentials: init?.credentials ?? "include",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export interface StatusResponse {
  active_sessions: number;
  auth_required?: boolean;
  auth_providers?: string[];
  config_path: string;
  memory_provider?: string;
  version: string;
}

export const api = {
  async getStatus(): Promise<StatusResponse> {
    return fetchJSON<StatusResponse>("/api/status");
  },
};
