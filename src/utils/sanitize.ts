import DOMPurify from 'dompurify';
import type { DOMPurify as DOMPurifyType } from 'dompurify';

// Server-side: eagerly initialize with JSDOM at module load
let purifyInstance: DOMPurifyType;

if (typeof window !== 'undefined') {
  // Browser environment
  purifyInstance = DOMPurify;
} else {
  // Server environment - import JSDOM synchronously at module level
  // This is fine because this code only runs once at startup on the server
  const jsdom = await import('jsdom');
  const dom = new jsdom.JSDOM('');
  purifyInstance = DOMPurify(dom.window);
}

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - Potentially unsafe HTML string
 * @param allowedTags - Optional array of allowed HTML tags (default: common safe tags)
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string, allowedTags?: string[]): string {
  if (!dirty) return '';

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

  return purifyInstance.sanitize(dirty, config) as string;
}

/**
 * Sanitize HTML with minimal restrictions (for trusted content with formatting)
 */
export function sanitizeHtmlPermissive(dirty: string): string {
  if (!dirty) return '';

  const config = {
    ALLOWED_ATTR: ['href', 'title', 'class', 'id', 'src', 'alt', 'target', 'rel', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
    RETURN_TRUSTED_TYPE: false,
  };

  return purifyInstance.sanitize(dirty, config) as string;
}
