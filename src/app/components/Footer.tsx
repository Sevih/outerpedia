// components/Footer.tsx
import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";

export default function Footer() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';

  return (
    <footer className="w-full border-t pt-2 pb-2 text-center text-sm text-muted-foreground">
      <div className="flex flex-col md:flex-row md:flex-wrap justify-center items-center gap-4 px-4 text-center">
        <p>
          © {new Date().getFullYear()} Outerpedia v{appVersion} – Fanmade Database for Outerplane. All rights reserved.
        </p>

        <nav aria-label="Footer Navigation" className="flex gap-4 flex-wrap justify-center">
          <Link
            href="https://github.com/Sevih/outerpedia"
            aria-label="GitHub repository for Outerpedia"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1"
          >
            <FaGithub /> GitHub
          </Link>

          <Link
            href="https://discord.gg/outerplaneglobal"
            aria-label="Outerplane Official Discord"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1"
          >
            <FaDiscord /> Outerplane Official Discord
          </Link>

          <Link
            href="https://discord.com/invite/keGhVQWsHv"
            aria-label="EvaMains Discord for Outerpedia community"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1"
          >
            <FaDiscord /> EvaMains Discord
          </Link>

          <Link href="/legal" className="text-sm hover:underline">
            Legal Notice
          </Link>

          <Link href="/changelog" className="text-sm text-muted-foreground hover:underline">
            Changelog
          </Link>
        </nav>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-muted-foreground max-w-4xl mx-auto px-4 leading-snug">
        Outerpedia is an unofficial fan-made project. All content related to <i>Outerplane</i>, including characters, images, and other game assets, is the property of VAGAMES CORP.
        This website is not affiliated with, endorsed by, or sponsored by VAGAMES CORP in any way.
      </p>
    </footer>
  );
}
