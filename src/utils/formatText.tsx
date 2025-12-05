import React from 'react';
import { sanitizeHtml } from './sanitize';

export default function formatEffectText(text: string): React.ReactElement {
  const colored = text.replace(/<color=(#[0-9a-fA-F]{6})>(.*?)<\/color>/g, (_, color, content) => {
    return `<span style="color: ${color}">${content}</span>`;
  });

  const withLineBreaks = colored.replace(/\\n|\\\\n/g, '<br />');

  // Sanitize to prevent XSS
  const sanitized = sanitizeHtml(withLineBreaks, ['span', 'br']);

  return <span dangerouslySetInnerHTML={{ __html: sanitized }} />;
}


export function toKebabCase(input: unknown): string {
  if (typeof input !== 'string') {
    console.warn('toKebabCase: input not a string:', input);
    return '';
  }

  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
