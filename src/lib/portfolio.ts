import type { Project } from "@/content/portfolio";

const safeUrl = (value: string) => {
  if (value.startsWith("/")) return !/^\/[\\/]/.test(value) && !value.includes("\\");
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
    if (
      !safeUrl(project.cover.src) ||
      (!project.concept && (!project.liveUrl || !safeUrl(project.liveUrl))) ||
      (project.before &&
        (project.concept ||
          project.embeddable === false ||
          !project.before.alt ||
          !safeUrl(project.before.image) ||
          !safeUrl(project.before.mobileImage) ||
          !project.before.siteUrl.startsWith("https://") ||
          !safeUrl(project.before.siteUrl)))
    ) {
      throw new Error(`${project.title}: unsafe URL`);
    }
  }

  return items;
}

export function getProjectSlug(search: string) {
  return new URLSearchParams(search).get("project")?.trim() || null;
}
