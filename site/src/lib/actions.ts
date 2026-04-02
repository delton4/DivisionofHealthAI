"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  getAdminByEmail,
  upsertOverride,
  addCustomPublication,
  removeCustomPublication,
  hideEntity,
  unhideEntity,
} from "./db";
import { createSession, verifySession, deleteSession } from "./session";

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const admin = await getAdminByEmail(email);
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
