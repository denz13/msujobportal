// Central API configuration for the Laravel + Inertia React frontend
// This mirrors the idea of vehiclemanagementappexpo/config/apiConfig.js
// and is the single source of truth for the API base URL and timeout.

// Default base URL:
// - If VITE_API_BASE_URL is set, we use that.
// - Otherwise, we fall back to `${window.location.origin}/api`,
//   which works perfectly with Herd (e.g. https://msujobportal.test/api).
const getDefaultApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL as string;
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}/api`;
  }

  // Very safe fallback – will be overridden in browser anyway.
  return "/api";
};

const DEFAULT_API_BASE_URL = getDefaultApiBaseUrl();
const DEFAULT_API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 15000);

export const API_BASE_URL = DEFAULT_API_BASE_URL;
export const API_TIMEOUT = DEFAULT_API_TIMEOUT;

export const getApiConfig = () => ({
  API_BASE_URL,
  API_TIMEOUT,
  source: import.meta.env.VITE_API_BASE_URL ? "vite-env" : "window.location.origin",
});

export default {
  API_BASE_URL,
  API_TIMEOUT,
  getApiConfig,
};

