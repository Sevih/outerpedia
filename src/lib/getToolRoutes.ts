import fs from "fs";
import path from "path";
import toolMetaRaw from "./toolDescriptions.json";

const TOOL_METADATA: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
    order: number;
    hide?: boolean
  }
> = toolMetaRaw;

const TOOLS_ROOT = path.join(process.cwd(), "src/app/(tools)");

export function getToolRoutes() {
  const entries = fs.readdirSync(TOOLS_ROOT, { withFileTypes: true });

  const routes = entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => {
      const pagePath = path.join(TOOLS_ROOT, dir.name, "page.tsx");
      if (!fs.existsSync(pagePath)) return null;

      const slug = dir.name;
      const metadata = TOOL_METADATA[slug] ?? {
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: "No description provided.",
        icon: "tool_default.png",
        order: 999,
      };
      if (metadata.hide) return null;

      let href = `/${slug}`;
      if (slug === "event") href = `/${slug}/history`;
      if (slug === "patch-history") href = `/${slug}?src=patchnotes`;
      // Retourne un tuple [order, routeSansOrder]
      return [metadata.order, { name: metadata.name, description: metadata.description, icon: metadata.icon, href }] as const;
    })
    .filter((x): x is readonly [number, { name: string; description: string; icon: string; href: string }] => x !== null)
    .sort((a, b) => a[0] - b[0])
    .map(([, route]) => route); // <- plus de 'order' ici

  return routes;
}

