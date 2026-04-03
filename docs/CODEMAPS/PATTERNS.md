# Code Patterns & Examples

**Last Updated:** 2026-04-03

This document contains battle-tested patterns used throughout the codebase. Use these as templates for new code.

## Pattern: Fetching Data with Overrides

### Simple Single Entity

```typescript
import { getResearcherWithOverrides } from "@/data";

export default async function ResearcherDetailPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const researcher = await getResearcherWithOverrides(params.slug);
  
  if (!researcher) {
    notFound();
  }
  
  return (
    <div>
      <h1>{researcher.name}</h1>
      {/* researcher.photo is override URL if set, else falls back to researcher.image */}
      <img src={researcher.photo || researcher.image} alt={researcher.name} />
    </div>
  );
}
```

### Multiple Entities with ISR

```typescript
import { getAllResearchersWithOverrides, getAllProjectsWithOverrides } from "@/data";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function TeamPage() {
  // Parallel fetch for better performance
  const [researchers, projects] = await Promise.all([
    getAllResearchersWithOverrides(),
    getAllProjectsWithOverrides(),
  ]);
  
  return (
    <div>
      {researchers.map(r => (
        <div key={r.id}>
          {/* Overrides already applied by data layer */}
          <h2>{r.name}</h2>
          <p>{r.title}</p>
        </div>
      ))}
    </div>
  );
}
```

## Pattern: Server Action with Validation

### Text Override Save

```typescript
"use server";

import { verifySession } from "@/lib/session";
import { upsertOverride } from "@/lib/db";
import { revalidatePath } from "next/cache";

const VALID_FIELDS = {
  researcher: new Set(["name", "title", "about", "photo", "credentials"]),
  project: new Set(["name", "about"]),
};

export async function saveTextOverride(
  entity: string,
  entityId: string,
  field: string,
  value: string,
  currentPath: string
) {
  // 1. Verify authentication
  const session = await verifySession();
  if (!session) {
    return { error: "Not authenticated." };
  }
  
  // 2. Validate inputs
  if (!VALID_FIELDS[entity as keyof typeof VALID_FIELDS]?.has(field)) {
    return { error: "Invalid field." };
  }
  
  // 3. Perform operation
  try {
    await upsertOverride(entity, entityId, field, value);
  } catch (error) {
    return { error: "Failed to save. Please try again." };
  }
  
  // 4. Revalidate cache
  revalidatePath(currentPath);
  
  // 5. Return success
  return { success: true };
}
```

### Add Custom Entity

```typescript
"use server";

import { verifySession } from "@/lib/session";
import { addCustomResearcher } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function addResearcher(formData: FormData): Promise<void> {
  // 1. Verify authentication
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated.");
  
  // 2. Extract inputs
  const name = formData.get("name") as string;
  const title = formData.get("title") as string;
  
  // 3. Validate inputs
  if (!name) throw new Error("Name is required.");
  
  // 4. Generate ID (custom entities use timestamp)
  const id = `custom-${Date.now()}`;
  
  // 5. Insert into database
  await addCustomResearcher({ id, name, title: title || "" });
  
  // 6. Revalidate affected paths
  revalidatePath("/team");
  revalidatePath("/admin/team");
  
  // 7. Redirect to appropriate page
  redirect("/admin/team");
}
```

### Delete with Branching Logic

```typescript
"use server";

import { verifySession } from "@/lib/session";
import { removeCustomResearcher, hideEntity } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function deleteResearcher(id: string) {
  // 1. Verify authentication
  const session = await verifySession();
  if (!session) return { error: "Not authenticated." };
  
  // 2. Branch logic based on entity type
  try {
    if (id.startsWith("custom-")) {
      // Custom entities: hard-delete
      await removeCustomResearcher(id);
    } else {
      // Static entities: soft-delete with hide marker
      await hideEntity("researcher", id);
    }
  } catch (error) {
    return { error: "Failed to delete. Please try again." };
  }
  
  // 3. Revalidate paths
  revalidatePath("/team");
  revalidatePath("/admin/team");
  
  return { success: true };
}
```

## Pattern: Editable Component

### Basic EditableText

```typescript
"use client";

import { useContext, useState } from "react";
import { AdminContext } from "@/components/AdminProvider";
import { saveTextOverride } from "@/lib/actions";

interface EditableTextProps {
  entity: string;
  entityId: string;
  field: string;
  value: string;
  multiline?: boolean;
  as?: "p" | "span" | "div";
  className?: string;
}

export default function EditableText({
  entity,
  entityId,
  field,
  value,
  multiline = false,
  as: Element = "span",
  className = "",
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { adminLoggedIn } = useContext(AdminContext);
  
  // Non-admin users see static text
  if (!adminLoggedIn) {
    return <Element className={className}>{value}</Element>;
  }
  
  // Admin users see editable version
  async function handleSave() {
    setLoading(true);
    setError(null);
    
    const result = await saveTextOverride(
      entity,
      entityId,
      field,
      editValue,
      typeof window !== "undefined" ? window.location.pathname : "/"
    );
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setEditing(false);
      setLoading(false);
    }
  }
  
  if (editing) {
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="inline-block"
      >
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={loading}
            className="block w-full p-2 border border-border rounded"
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            disabled={loading}
            className="block w-full p-2 border border-border rounded"
          />
        )}
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1 bg-foreground text-background rounded text-sm"
          >
            {loading ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setEditValue(value);
              setError(null);
            }}
            disabled={loading}
            className="px-3 py-1 bg-border text-foreground rounded text-sm"
          >
            Cancel
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    );
  }
  
  return (
    <Element className={`group relative ${className}`}>
      {value}
      <button
        onClick={() => setEditing(true)}
        className="ml-2 opacity-0 group-hover:opacity-100 text-text-muted text-xs"
        aria-label={`Edit ${field}`}
      >
        ✎ Edit
      </button>
    </Element>
  );
}
```

## Pattern: Data Merging in Data Layer

### Merge Single Entity with Overrides

```typescript
async function mergeOverrides<T>(
  entity: string,
  entityId: string,
  base: T
): Promise<T> {
  // Skip DB in static export mode
  if (process.env.GITHUB_ACTIONS === "true") return base;
  
  try {
    const { getOverrides } = await import("@/lib/db");
    const overrides = await getOverrides(entity, entityId);
    
    if (Object.keys(overrides).length === 0) return base;
    
    // Shallow merge: overrides layer on top of base
    return { ...base, ...overrides } as T;
  } catch {
    // DB unavailable: return base unchanged (graceful degradation)
    return base;
  }
}
```

### Batch Merge Multiple Entities

```typescript
async function batchMergeOverrides<T extends { id: string }>(
  entity: string,
  items: T[]
): Promise<T[]> {
  // Skip DB in static export
  if (process.env.GITHUB_ACTIONS === "true") return items;
  if (items.length === 0) return items;
  
  try {
    const { getBatchOverrides } = await import("@/lib/db");
    
    // Single query for all overrides
    const allOverrides = await getBatchOverrides(
      entity,
      items.map((item) => item.id)
    );
    
    // Apply overrides to each item
    return items.map((item) => {
      const overrides = allOverrides[item.id];
      if (!overrides || Object.keys(overrides).length === 0) return item;
      return { ...item, ...overrides };
    });
  } catch {
    // DB unavailable: return items unchanged
    return items;
  }
}
```

### Get All with Custom Entities + Hiding + Overrides

```typescript
export async function getAllResearchersWithOverrides(): Promise<Researcher[]> {
  // 1. Start with static JSON
  let allResearchers = [...researchers];
  
  // 2. Try to fetch custom entities and hidden IDs from DB
  try {
    const { getCustomResearchers, getHiddenEntityIds } = await import("@/lib/db");
    
    // Parallel fetch for performance
    const [customRows, hiddenIds] = await Promise.all([
      getCustomResearchers(),
      getHiddenEntityIds("researcher"),
    ]);
    
    // 3. Filter out hidden static entities
    allResearchers = allResearchers.filter((r) => !hiddenIds.has(r.id));
    
    // 4. Append custom researchers with minimal props
    for (const row of customRows) {
      allResearchers.push({
        id: row.id,
        name: row.name,
        title: row.title,
        about: "",
        slug: row.id, // Use ID as slug for custom entities
        projectIds: [],
        publicationIds: [],
        image: "",
      });
    }
  } catch {
    // DB unavailable: continue with static only
  }
  
  // 5. Apply text overrides to all entities
  return batchMergeOverrides("researcher", allResearchers);
}
```

## Pattern: Component with Override Support

```typescript
interface TeamCardProps {
  researcher: Researcher;
}

export function TeamCard({ researcher }: TeamCardProps) {
  return (
    <Link href={`/team/${researcher.slug}`} className="group">
      <div className="p-4 border border-border rounded">
        {/* Photo shows override URL if set, falls back to original image */}
        <img
          src={researcher.photo || researcher.image}
          alt={researcher.name}
          className="w-full aspect-square object-cover rounded"
        />
        
        {/* Name and title already have overrides applied by data layer */}
        <h3 className="mt-2 font-semibold">{researcher.name}</h3>
        <p className="text-sm text-text-muted">{researcher.title}</p>
      </div>
    </Link>
  );
}
```

## Pattern: Admin Manager Component

```typescript
"use client";

import { useState } from "react";
import { addResearcher, deleteResearcher, restoreResearcher } from "@/lib/actions";
import { Researcher } from "@/lib/types";

interface TeamManagerProps {
  researchers: Researcher[];
}

export function TeamManager({ researchers }: TeamManagerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function handleDelete(id: string) {
    if (!confirm("Delete this researcher?")) return;
    
    setLoading(true);
    setError(null);
    
    const result = await deleteResearcher(id);
    
    if (result?.error) {
      setError(result.error);
    } else {
      // Page will revalidate automatically
    }
    setLoading(false);
  }
  
  return (
    <div>
      {/* Add form */}
      <form
        action={addResearcher}
        className="p-4 border border-border rounded mb-6"
      >
        <h2 className="mb-4 font-semibold">Add Researcher</h2>
        <input
          type="text"
          name="name"
          placeholder="Name"
          required
          className="w-full p-2 border border-border rounded mb-2"
        />
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full p-2 border border-border rounded mb-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-foreground text-background rounded"
        >
          Add
        </button>
      </form>
      
      {error && <p className="text-red-500 mb-4">{error}</p>}
      
      {/* Researcher list */}
      <div className="space-y-4">
        {researchers.map((researcher) => (
          <div key={researcher.id} className="p-4 border border-border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{researcher.name}</h3>
                <p className="text-sm text-text-muted">{researcher.title}</p>
              </div>
              <div className="flex gap-2">
                {researcher.id.startsWith("custom-") ? (
                  <button
                    onClick={() => handleDelete(researcher.id)}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm"
                  >
                    Delete
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleDelete(researcher.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-yellow-600 text-white rounded text-sm"
                    >
                      Hide
                    </button>
                    <button
                      onClick={() => restoreResearcher(researcher.id)}
                      disabled={loading}
                      className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                    >
                      Restore
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Pattern: Session Verification

```typescript
"use server";

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET || "");

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  
  if (!token) return null;
  
  try {
    const verified = await jwtVerify(token, SECRET);
    return verified.payload;
  } catch {
    return null;
  }
}
```

## Pattern: Rate Limiting

```typescript
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

// Usage in login action:
if (!checkRateLimit(ip)) {
  return { error: "Too many login attempts. Try again in 15 minutes." };
}
```

## Pattern: File Upload Validation

```typescript
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function validateFile(file: File): { valid: true } | { valid: false; error: string } {
  const ext = MIME_TO_EXT[file.type];
  if (!ext) {
    return { valid: false, error: "Only JPEG, PNG, WebP, and GIF images are allowed." };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: "File must be under 5 MB." };
  }
  
  return { valid: true };
}
```

## Pattern: Error Handling in Server Components

```typescript
export default async function MyPage() {
  try {
    const data = await fetchData();
    return <div>{/* render data */}</div>;
  } catch (error) {
    // Log for debugging
    console.error("Failed to fetch:", error);
    
    // Show user-friendly error
    return <div>Failed to load page. Please try again later.</div>;
  }
}
```

---

**Use these patterns as templates for new code. When in doubt, follow the style of existing similar code.**
