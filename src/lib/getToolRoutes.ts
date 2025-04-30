import fs from "fs";
import path from "path";
import toolMetaRaw from "./toolDescriptions.json"; // on importe le .json généré

const TOOL_METADATA: Record<
  string,
  {
    name: string;
    description: string;
    icon: string;
    order: number;
  }
> = toolMetaRaw;

const TOOLS_ROOT = path.join(process.cwd(), "src/app/(tools)");

export function getToolRoutes() {
  const entries = fs.readdirSync(TOOLS_ROOT, { withFileTypes: true });

  const routes = entries
    .filter((entry) => entry.isDirectory())
    .map((dir) => {
      const pagePath = path.join(TOOLS_ROOT, dir.name, "page.tsx");

      if (fs.existsSync(pagePath)) {
        const slug = dir.name;
        const metadata = TOOL_METADATA[slug] ?? {
          name: slug.charAt(0).toUpperCase() + slug.slice(1),
          description: "No description provided.",
          icon: "tool_default.png",
          order: 999,
        };

        return {
          name: metadata.name,
          description: metadata.description,
          icon: metadata.icon,
          href: `/${slug}`,
          order: metadata.order,
        };
      }

      return null;
    })
    .filter((route): route is Exclude<typeof route, null> => route !== null)
    .sort((a, b) => a.order - b.order)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(({ order, ...rest }) => rest); // on retire order avant retour

  return routes;
}
