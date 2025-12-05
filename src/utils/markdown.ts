import MarkdownIt from 'markdown-it'
import { sanitizeHtml } from './sanitize'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
})

export function renderMarkdown(content: string): string {
  const html = md.render(content)
  // Sanitize to prevent XSS from markdown content
  return sanitizeHtml(html)
}
