import { RootDocument } from '../root-document';

// Layout RACINE des routes /dev (dev-only, non buildé en prod) : pas de
// `app/layout.tsx` global — chaque racine rend son <html> via RootDocument.
export const metadata = { title: { template: '%s | Outerpedia Dev', default: 'Dev' } };

export default function DevLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="en">{children}</RootDocument>;
}
