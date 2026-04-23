/**
 * Centralized media URL builder.
 * Every component should use this instead of hardcoding "http://localhost:5000".
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

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
