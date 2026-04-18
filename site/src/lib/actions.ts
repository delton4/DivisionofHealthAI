"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import {
  getAdminByUsername,
  upsertOverride,
  addCustomPublication,
  removeCustomPublication,
  addCustomProject,
  removeCustomProject,
  addCustomResearcher,
  removeCustomResearcher,
  addDbAlumni,
  removeDbAlumni,
  hideEntity,
  unhideEntity,
  checkRateLimit,
} from "./db";
import { createSession, verifySession, deleteSession } from "./session";
import { headers } from "next/headers";

// Rate limiting is handled by checkRateLimit() in db.ts (Neon-backed, works across serverless instances)

// Exponential delay on failed attempts (best-effort, in-process only)
function failDelay(attempt: number): Promise<void> {
  const ms = Math.min(1000 * 2 ** (attempt - 1), 8000);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---- Safe FormData extraction ----

function getFormString(form: FormData, key: string): string {
  const val = form.get(key);
  if (typeof val !== "string") throw new Error(`Missing required field: ${key}`);
  return val;
}

function getFormStringOptional(form: FormData, key: string): string {
  const val = form.get(key);
  return typeof val === "string" ? val : "";
}

function getFormFile(form: FormData, key: string): File {
  const val = form.get(key);
  if (!(val instanceof File)) throw new Error(`Missing required file: ${key}`);
  return val;
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return { error: "Too many login attempts. Try again in 15 minutes." };
  }

  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return { error: "Username and password are required." };
  }

  const admin = await getAdminByUsername(username);
  if (!admin) {
    await failDelay(3);
    return { error: "Invalid credentials." };
  }

  const valid = await compare(password, admin.password_hash);
  if (!valid) {
    await failDelay(3);
    return { error: "Invalid credentials." };
  }

  await createSession(admin.id, admin.email);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

import {
  VALID_ENTITIES,
  VALID_FIELDS,
  VALID_PAGE_IDS,
  VALID_PAGE_FIELDS,
} from "./allowed-fields";

type SaveResult = { success: true } | { error: string };

export async function saveTextOverride(
  entity: string,
  entityId: string,
  field: string,
  value: string,
  currentPath: string
): Promise<SaveResult> {
  const session = await verifySession();
  if (!session) {
    return { error: "Not authenticated." };
  }

  if (!VALID_ENTITIES.has(entity)) {
    return { error: "Invalid entity type." };
  }

  if (entity === "page") {
    if (!VALID_PAGE_IDS.has(entityId)) {
      return { error: "Invalid page." };
    }
    const pageFields = VALID_PAGE_FIELDS[entityId];
    if (!pageFields?.has(field)) {
      return { error: "Invalid field." };
    }
    try {
      await upsertOverride(entity, entityId, field, value);
    } catch {
      return { error: "Failed to save. Please try again." };
    }
    revalidatePath(currentPath);
    return { success: true };
  }

  const allowedFields = VALID_FIELDS[entity];
  if (allowedFields && !allowedFields.has(field)) {
    return { error: "Invalid field." };
  }

  try {
    await upsertOverride(entity, entityId, field, value);
  } catch {
    return { error: "Failed to save. Please try again." };
  }
  revalidatePath(currentPath);
  return { success: true };
}

export async function addPublication(formData: FormData): Promise<void> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated.");

  const name = getFormString(formData, "name");
  const journal = getFormStringOptional(formData, "journal");
  const abstract = getFormStringOptional(formData, "abstract");
  const publicationUrl = getFormStringOptional(formData, "publicationUrl");

  const id = `custom-${crypto.randomUUID()}`;
  await addCustomPublication({ id, name, journal, abstract, publicationUrl });

  revalidatePath("/publications");
  revalidatePath("/admin/publications");
  revalidatePath("/");
  redirect("/admin/publications");
}

export async function deletePublication(id: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  if (id.startsWith("custom-")) {
    await removeCustomPublication(id);
  } else {
    await hideEntity("publication", id);
  }

  revalidatePath("/publications");
  revalidatePath("/admin/publications");
  revalidatePath("/");
  return { success: true };
}

export async function restorePublication(id: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  await unhideEntity("publication", id);

  revalidatePath("/publications");
  revalidatePath("/admin/publications");
  revalidatePath("/");
  return { success: true };
}

// ---- Project management ----

export async function addProject(formData: FormData): Promise<void> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated.");

  const name = getFormString(formData, "name");
  const about = getFormStringOptional(formData, "about");

  const id = `custom-${crypto.randomUUID()}`;
  await addCustomProject({ id, name, about });

  revalidatePath("/research");
  revalidatePath("/admin/research");
  revalidatePath("/");
  redirect("/admin/research");
}

export async function deleteProject(id: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  if (id.startsWith("custom-")) {
    await removeCustomProject(id);
  } else {
    await hideEntity("project", id);
  }

  revalidatePath("/research");
  revalidatePath("/admin/research");
  revalidatePath("/");
  return { success: true };
}

export async function restoreProject(id: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  await unhideEntity("project", id);

  revalidatePath("/research");
  revalidatePath("/admin/research");
  revalidatePath("/");
  return { success: true };
}

// ---- Researcher management ----

export async function addResearcher(formData: FormData): Promise<void> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated.");

  const name = getFormString(formData, "name");
  const title = getFormStringOptional(formData, "title");

  const id = `custom-${crypto.randomUUID()}`;
  await addCustomResearcher({ id, name, title });

  revalidatePath("/team");
  revalidatePath("/admin/team");
  redirect("/admin/team");
}

export async function moveResearcherToAlumni(id: string, name: string, credentials: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  // Add to alumni list
  await addDbAlumni(name, credentials);

  // Hide from active team
  if (id.startsWith("custom-")) {
    await removeCustomResearcher(id);
  } else {
    await hideEntity("researcher", id);
  }

  revalidatePath("/team");
  revalidatePath("/admin/team");
  return { success: true };
}

export async function deleteAlumni(alumniId: number) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  await removeDbAlumni(alumniId);
  revalidatePath("/team");
  revalidatePath("/admin/team");
  return { success: true };
}

export async function restoreResearcher(id: string) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  await unhideEntity("researcher", id);
  revalidatePath("/team");
  revalidatePath("/admin/team");
  return { success: true };
}

// ---- Association management (researcher ↔ publication/project) ----

const VALID_ASSOCIATION_TYPES = new Set(["publication", "project"]);

export async function linkEntityToResearcher(
  researcherId: string,
  entityType: string,
  entityId: string
): Promise<SaveResult> {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  if (!VALID_ASSOCIATION_TYPES.has(entityType)) {
    return { error: "Invalid entity type." };
  }
  if (!researcherId || !entityId) {
    return { error: "Missing researcher or entity ID." };
  }

  try {
    const { upsertAssociationOverride } = await import("./db");
    await upsertAssociationOverride(
      researcherId,
      entityType as "publication" | "project",
      entityId,
      "add"
    );
  } catch (err) {
    console.error("linkEntityToResearcher failed:", err);
    return { error: "Failed to link. Please try again." };
  }

  revalidatePath("/team", "layout");
  revalidatePath("/research", "layout");
  revalidatePath("/publications");
  revalidatePath("/");
  return { success: true };
}

export async function unlinkEntityFromResearcher(
  researcherId: string,
  entityType: string,
  entityId: string
): Promise<SaveResult> {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  if (!VALID_ASSOCIATION_TYPES.has(entityType)) {
    return { error: "Invalid entity type." };
  }
  if (!researcherId || !entityId) {
    return { error: "Missing researcher or entity ID." };
  }

  try {
    const { upsertAssociationOverride } = await import("./db");
    await upsertAssociationOverride(
      researcherId,
      entityType as "publication" | "project",
      entityId,
      "remove"
    );
  } catch {
    return { error: "Failed to unlink. Please try again." };
  }

  revalidatePath("/team", "layout");
  revalidatePath("/research", "layout");
  revalidatePath("/publications");
  revalidatePath("/");
  return { success: true };
}

// ---- Photo upload ----

export async function uploadResearcherPhoto(formData: FormData) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  const file = getFormFile(formData, "file");
  const researcherId = getFormString(formData, "researcherId");
  const researcherSlug = getFormString(formData, "researcherSlug");

  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return { error: "File must be under 5 MB." };
  }

  // Resize and convert to WebP before uploading
  const sharp = (await import("sharp")).default;
  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const blob = await put(
    `photos/${researcherId}-${Date.now()}.webp`,
    optimized,
    { access: "public", contentType: "image/webp" }
  );

  await upsertOverride("researcher", researcherId, "photo", blob.url);

  revalidatePath(`/team/${researcherSlug}`);
  revalidatePath("/team");
  revalidatePath("/");
  return { success: true, url: blob.url };
}
