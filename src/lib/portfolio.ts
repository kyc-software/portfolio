import type { Project } from "@/content/portfolio";

const safeUrl = (value: string) => {
  if (value.startsWith("/")) return true;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
};

export function validateProjects(items: Project[]) {
  const slugs = new Set<string>();

  for (const project of items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(project.slug)) {
      throw new Error(`${project.title}: invalid slug`);
    }
    if (slugs.has(project.slug)) throw new Error(`${project.title}: duplicate slug`);
    slugs.add(project.slug);

    if (!project.cover.alt || project.cover.width <= 0 || project.cover.height <= 0) {
      throw new Error(`${project.title}: invalid cover`);
    }
    if (!safeUrl(project.cover.src) || !safeUrl(project.liveUrl)) {
      throw new Error(`${project.title}: unsafe URL`);
    }
  }

  return items;
}

export function getProjectSlug(search: string) {
  return new URLSearchParams(search).get("project")?.trim() || null;
}
