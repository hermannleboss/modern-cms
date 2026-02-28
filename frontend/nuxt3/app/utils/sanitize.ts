import DOMPurify from 'dompurify';

export function sanitizeHtml(html: string): string {
  if (import.meta.server) return html;
  return DOMPurify.sanitize(html);
}
