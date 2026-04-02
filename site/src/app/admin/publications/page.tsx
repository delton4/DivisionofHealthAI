import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/session";
import { getAllPublicationsWithOverrides, publications as staticPubs } from "@/data";
import { getHiddenEntityIds } from "@/lib/db";
import { PublicationManager } from "./PublicationManager";

export const metadata: Metadata = { title: "Manage Publications" };

export default async function AdminPublicationsPage() {
  const session = await verifySession();
  if (!session) redirect("/admin/login");

  const [allPubs, hiddenIds] = await Promise.all([
    getAllPublicationsWithOverrides(),
    getHiddenEntityIds("publication"),
  ]);

  // Get hidden pubs so admin can restore them
  const hiddenPubs = staticPubs
    .filter((p) => hiddenIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, journal: p.journal }));

  return (
    <div className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-display text-3xl tracking-tight">Manage Publications</h1>
        <p className="text-sm text-text-muted mt-2">
          {allPubs.length} active publications. Add new ones or remove existing ones.
        </p>

        <PublicationManager
          publications={allPubs}
          hiddenPubs={hiddenPubs}
        />
      </div>
    </div>
  );
}
