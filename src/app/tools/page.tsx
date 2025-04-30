import { getToolRoutes } from "@/lib/getToolRoutes";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-static";

export default function ToolsPage() {
  const tools = getToolRoutes();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-2xl border p-6 hover:shadow-lg transition bg-card hover:bg-muted/20"
          >
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Image
                  src={`/images/ui/${tool.icon}`}
                  alt={`${tool.name} icon`}
                  width={64}
                  height={64}
                  className="rounded"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-1">{tool.name}</h2>
                <p className="text-sm text-muted-foreground leading-snug">{tool.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
