/**
 * Centralized media URL builder.
 * Every component should use this instead of hardcoding "http://localhost:5000".
 */
// Extract base URL from API_URL by removing /api suffix
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;

/**
 * Return the full URL for a media path stored in the DB.
 * @param {string} path  – e.g. "/uploads/profiles/abc.jpg"
 * @returns {string|null}
 */
export function getMediaUrl(path) {
    if (!path) return null;
    if (path.startsWith('http')) return path;   // already absolute
    return `${API_BASE}${path}`;
}

export { API_BASE };
