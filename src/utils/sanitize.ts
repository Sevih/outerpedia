import DOMPurify from 'dompurify';

/**
 * Get DOMPurify instance - works in both browser and server (SSR)
 */
function getPurify() {
  if (typeof window !== 'undefined') {
    // Browser environment
    return DOMPurify;
  } else {
    // Server environment - use JSDOM
    const { JSDOM } = require('jsdom');
    const window = new JSDOM('').window;
    // @ts-ignore - JSDOM window is compatible with DOMPurify
    return DOMPurify(window);
  }
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @param allowedTags - Optional array of allowed HTML tags (default: common safe tags)
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
  if (!dirty) return '';

  const purify = getPurify();

  const config = {
    ALLOWED_TAGS: allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'span', 'div',
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'src', 'alt', 'target', 'rel', 'style'],
    ALLOW_DATA_ATTR: false,
    RETURN_TRUSTED_TYPE: false,
  };

  return purify.sanitize(dirty, config) as string;
}

/**
 * Sanitize HTML with minimal restrictions (for trusted content with formatting)
 */
export function sanitizeHtmlPermissive(dirty: string): string {
  if (!dirty) return '';

  const purify = getPurify();

  const config = {
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'src', 'alt', 'target', 'rel', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    RETURN_TRUSTED_TYPE: false,
  };

  return purify.sanitize(dirty, config) as string;
}
