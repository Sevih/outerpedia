// src/lib/getToolMeta.ts
import toolMetaRaw from "./toolDescriptions.json";

type ToolMetadata = {
  icon: string;
  order: number;
  hide?: boolean;
};

const TOOL_METADATA: Record<string, ToolMetadata> = toolMetaRaw;

const DEFAULT_ICON = "nav/CM_Guild_NoticeBoard.webp";

/**
 * Get the OG/Twitter image configuration for a tool page
 * @param slug - The tool slug (e.g., "ee-priority", "gear-solver")
 * @param domain - The domain for absolute URL (e.g., "outerpedia.com")
 * @returns Image config object ready for createPageMetadata
 */
export function getToolOgImage(slug: string, domain: string) {
  const meta = TOOL_METADATA[slug];
  const iconPath = meta?.icon ?? DEFAULT_ICON;

  // Convert .webp to .png for metadata (project rule)
  const pngPath = iconPath.replace(/\.webp$/i, ".png");

  return {
    url: `https://${domain}/images/ui/${pngPath}`,
    width: 150,
    height: 150,
  };
}

/**
 * Get tool metadata including icon path
 * @param slug - The tool slug
 * @returns Tool metadata or default values
 */
export function getToolMeta(slug: string): ToolMetadata {
  return (
    TOOL_METADATA[slug] ?? {
      icon: DEFAULT_ICON,
      order: 999,
    }
  );
}
