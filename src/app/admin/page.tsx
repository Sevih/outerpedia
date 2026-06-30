import Link from 'next/link';

export default function AdminHome() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-content-strong text-xl font-semibold">Administration</h1>
        <p className="text-content-muted text-sm">
          Édition locale du contenu curé (committé via git). Outil dev-only.
        </p>
      </div>
      <Link
        href="/admin/characters"
        className="border-line bg-surface-raised hover:border-accent block rounded-lg border p-4 transition"
      >
        <div className="text-content-strong font-medium">Personnages</div>
        <div className="text-content-subtle text-sm">
          Tiers, rôle, tags, priorité de skills, vidéo…
        </div>
      </Link>
    </div>
  );
}
