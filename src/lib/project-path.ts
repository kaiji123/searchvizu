// The ID provides uniqueness and stable access; the title is a readable label.
export function projectPath(id: string, title: string) {
  const slug = title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64).replace(/-+$/g, "") || "project";
  return `/projects/${id}/${slug}`;
}
