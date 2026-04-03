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
} from "./db";
import { createSession, verifySession, deleteSession } from "./session";
import { headers } from "next/headers";

// Simple in-memory rate limiter for login attempts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // Prune expired entries to prevent unbounded growth
  if (loginAttempts.size > 1000) {
    for (const [key, val] of loginAttempts) {
      if (now > val.resetAt) loginAttempts.delete(key);
    }
  }

  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count++;
  return entry.count <= MAX_ATTEMPTS;
}

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return { error: "Too many login attempts. Try again in 15 minutes." };
  }

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required." };
  }

  const admin = await getAdminByUsername(username);
  if (!admin) {
    return { error: "Invalid credentials." };
  }

  const valid = await compare(password, admin.password_hash);
  if (!valid) {
    return { error: "Invalid credentials." };
  }

  await createSession(admin.id, admin.email);
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/");
}

export async function saveTextOverride(
  entity: string,
  entityId: string,
  field: string,
  value: string,
  currentPath: string
) {
  const session = await verifySession();
  if (!session) {
    return { error: "Not authenticated." };
  }

  await upsertOverride(entity, entityId, field, value);
  revalidatePath(currentPath);
  return { success: true };
}

export async function addPublication(formData: FormData): Promise<void> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated.");

  const name = formData.get("name") as string;
  const journal = formData.get("journal") as string;
  const abstract = formData.get("abstract") as string;
  const publicationUrl = formData.get("publicationUrl") as string;

  if (!name) throw new Error("Title is required.");

  const id = `custom-${Date.now()}`;
  await addCustomPublication({ id, name, journal: journal || "", abstract: abstract || "", publicationUrl: publicationUrl || "" });

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

  const name = formData.get("name") as string;
  const about = formData.get("about") as string;
  if (!name) throw new Error("Name is required.");

  const id = `custom-${Date.now()}`;
  await addCustomProject({ id, name, about: about || "" });

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

  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  if (!name) throw new Error("Name is required.");

  const id = `custom-${Date.now()}`;
  await addCustomResearcher({ id, name, title: title || "" });

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

// ---- Photo upload ----

export async function uploadResearcherPhoto(formData: FormData) {
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };

  const file = formData.get("file") as File;
  const researcherId = formData.get("researcherId") as string;
  const researcherSlug = formData.get("researcherSlug") as string;

  if (!file || !researcherId) return { error: "Missing file or researcher ID." };

  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }

  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_SIZE) {
    return { error: "File must be under 5 MB." };
  }

  const blob = await put(`photos/${researcherId}-${Date.now()}.${file.name.split(".").pop()}`, file, {
    access: "public",
  });

  await upsertOverride("researcher", researcherId, "photo", blob.url);

  revalidatePath(`/team/${researcherSlug}`);
  revalidatePath("/team");
  revalidatePath("/");
  return { success: true, url: blob.url };
}
