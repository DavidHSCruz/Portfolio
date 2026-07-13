import { getProjects } from "@/lib/projects";

export const runtime = "nodejs";

export async function GET() {
  const projects = await getProjects();
  return Response.json(projects, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
