// components/Footer.tsx
import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full mt-2 border-t pt-2 pb-2 text-center text-sm text-muted-foreground">
      <div className="flex flex-col md:flex-row justify-center items-center gap-4">
        <p>© {new Date().getFullYear()} Outerpedia. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="https://github.com/Sevih/outerpedia" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
            <FaGithub /> GitHub
          </Link>
          <Link href="https://discord.com/invite/outerplaneglobal" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
            <FaDiscord /> Outerplane Official Discord
          </Link>
          <Link href="https://discord.gg/keGhVQWsHv" target="_blank" rel="noopener noreferrer" className="hover:underline inline-flex items-center gap-1">
            <FaDiscord /> EvaMains Discord
          </Link>
          <Link href="/changelog" className="text-sm text-muted-foreground hover:underline">
            Changelog
          </Link>

        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-4 text-xs text-muted-foreground max-w-4xl mx-auto px-4 leading-snug">
  Outerpedia is an unofficial fan-made project. All content related to <i>Outerplane</i>, including characters, images, and game assets, are the property of Smilegate Holdings, Inc., Megaport Branch.
  This website is not affiliated with, endorsed, or sponsored by Smilegate in any way.
</p>

    </footer>
  );
}
