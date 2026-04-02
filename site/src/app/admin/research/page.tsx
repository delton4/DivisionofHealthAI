import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAllProjectsWithOverrides, projects as staticProjects } from "@/data";
import { getHiddenEntityIds } from "@/lib/db";
import { ProjectManager } from "./ProjectManager";

export const metadata: Metadata = { title: "Manage Research" };

export default async function AdminResearchPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const [allProjects, hiddenIds] = await Promise.all([
    getAllProjectsWithOverrides(),
    getHiddenEntityIds("project"),
  ]);

  const hiddenProjects = staticProjects
    .filter((p) => hiddenIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-display text-3xl tracking-tight">Manage Research</h1>
        <p className="text-sm text-text-muted mt-2">
          {allProjects.length} active projects.
        </p>
        <ProjectManager projects={allProjects} hiddenProjects={hiddenProjects} />
      </div>
    </div>
  );
}
