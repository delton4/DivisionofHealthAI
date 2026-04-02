import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAllResearchersWithOverrides, getAllAlumni, researchers as staticResearchers } from "@/data";
import { getHiddenEntityIds, getDbAlumni } from "@/lib/db";
import { TeamManager } from "./TeamManager";

export const metadata: Metadata = { title: "Manage Team" };

export default async function AdminTeamPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const [allResearchers, allAlumni, hiddenIds, dbAlumniRows] = await Promise.all([
    getAllResearchersWithOverrides(),
    getAllAlumni(),
    getHiddenEntityIds("researcher"),
    getDbAlumni(),
  ]);

  const hiddenResearchers = staticResearchers
    .filter((r) => hiddenIds.has(r.id))
    .map((r) => ({ id: r.id, name: r.name, title: r.title }));

  const dbAlumni = (dbAlumniRows as { id: number; name: string; credentials: string }[]).map((row) => ({
    id: row.id,
    name: row.name,
    credentials: row.credentials,
  }));

  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-display text-3xl tracking-tight">Manage Team</h1>
        <p className="text-sm text-text-muted mt-2">
          {allResearchers.length} active researchers, {allAlumni.length} alumni.
        </p>
        <TeamManager
          researchers={allResearchers}
          hiddenResearchers={hiddenResearchers}
          dbAlumni={dbAlumni}
        />
      </div>
    </div>
  );
}
