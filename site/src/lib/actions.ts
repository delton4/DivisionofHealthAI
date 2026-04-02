"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminByEmail, upsertOverride } from "./db";
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
