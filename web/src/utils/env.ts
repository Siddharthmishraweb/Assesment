/**
 * Environment utility for accessing environment variables
 * Provides type-safe access to environment variables with fallbacks
 */

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:3003 if not set
 */
export const getApiBaseUrl = (): string => {
  const apiUrl = (import.meta as any).env?.VITE_API_URL as string | undefined;
  
  if (!apiUrl) {
    console.warn('VITE_API_URL not found in environment, using default: http://localhost:3003');
    return 'http://localhost:3003';
  }
  
  return apiUrl;
};

/**
 * Build a full API endpoint URL
 */
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${baseUrl}/${cleanEndpoint}`;
};

/**
 * Build a stream URL (for EventSource)
 */
export const buildStreamUrl = (endpoint: string, params?: Record<string, string>): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${baseUrl}/${cleanEndpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams(params);
    return `${url}?${searchParams.toString()}`;
  }
  
  return url;
};