# Admin CMS Codemap

**Last Updated:** 2026-04-03  
**Entry Points:** `/src/app/admin/login`, `/src/app/admin/team|research|publications`

## Architecture

```
Admin System
├── Authentication
│   ├── /admin/login (LoginForm)
│   └── Session verification on all mutations
├── Content Management
│   ├── /admin/team (TeamManager)
│   │   ├── Add researcher (form)
│   │   ├── Hide/restore (button)
│   │   └── Move to alumni (button)
│   ├── /admin/research (ProjectManager)
│   │   ├── Add project (form)
│   │   ├── Hide/restore (button)
│   │   └── Edit fields (EditableText)
│   └── /admin/publications (PublicationManager)
│       ├── Add publication (form)
│       ├── Hide/restore (button)
│       └── Edit fields (EditableText)
└── Inline Editing
    └── EditableText on public pages (visible when admin logged in)
```

## Login Flow

### Login Page: `/admin/login`

**File:** `/src/app/admin/login/page.tsx`

Renders `LoginForm` component.

### LoginForm Component

**File:** `/src/app/admin/login/LoginForm.tsx`

```typescript
"use client"

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const formAction = useFormAction();

  // Form submission to server action `login()`
  // On error: display message
  // On success: redirect to home (handled by action)
}
```

- Uses `useFormAction` (form state pattern)
- Username & password inputs
- Calls `login()` server action
- Displays error message if auth fails
- Rate limiting enforced on server (5 attempts / 15 min)
- Exponential backoff delay on invalid password

### Session Management

**File:** `/src/lib/session.ts`

- `createSession(adminId, username)` — Sets JWT cookie + hint cookie
- `verifySession()` — Reads and validates JWT cookie, returns payload
- `deleteSession()` — Clears both cookies
- Uses **jose** library for JWT encryption/decryption
- `SESSION_SECRET` env var (32+ chars)

### Admin Provider Context

**File:** `/src/components/AdminProvider.tsx`

```typescript
"use client"

export default function AdminProvider({ children }: { children: React.ReactNode }) {
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  useEffect(() => {
    // Check hint cookie `admin_logged_in` to set state
    // Used by EditableText to show/hide edit buttons
  }, []);

  return (
    <AdminContext.Provider value={{ adminLoggedIn }}>
      {children}
    </AdminContext.Provider>
  );
}
```

- Provides `adminLoggedIn` context to entire app
- Reads hint cookie to determine login state
- Used by `EditableText` to show edit UI on public pages

## Content Management Pages

All admin pages follow this pattern:
1. Verify session (redirect to login if not authenticated)
2. Fetch entities with overrides
3. Render manager component (add form + list with actions)

### Team Manager: `/admin/team`

**File:** `/src/app/admin/team/page.tsx`

Page component that:
1. Calls `getAllResearchersWithOverrides()` to fetch all researchers
2. Renders `TeamManager` component with full list

**File:** `/src/app/admin/team/TeamManager.tsx`

Renders:
- **Add Form:** Input for name, title → calls `addResearcher()`
- **List:**
  - Static researchers with hide/restore buttons
  - Custom researchers with delete button
  - Each row shows:
    - Name (with link to `/team/[slug]`)
    - Title
    - Photo (if uploaded) with upload button
    - Edit button (inline edit mode)
    - Action buttons (hide/restore/delete)
    - Move to alumni button

### Project Manager: `/admin/research`

**File:** `/src/app/admin/research/page.tsx`

Page component that:
1. Calls `getAllProjectsWithOverrides()` to fetch all projects
2. Renders `ProjectManager` component with full list

**File:** `/src/app/admin/research/ProjectManager.tsx`

Renders:
- **Add Form:** Input for name, about → calls `addProject()`
- **List:**
  - Each project row shows:
    - Name (editable via EditableText)
    - About (editable via EditableText)
    - Action buttons (hide/restore/delete)

### Publication Manager: `/admin/publications`

**File:** `/src/app/admin/publications/page.tsx`

Page component that:
1. Calls `getAllPublicationsWithOverrides()` to fetch all publications
2. Renders `PublicationManager` component with full list

**File:** `/src/app/admin/publications/PublicationManager.tsx`

Renders:
- **Add Form:** Inputs for name, journal, abstract, publicationUrl → calls `addPublication()`
- **List:**
  - Each publication row shows:
    - Name (editable via EditableText)
    - Journal (editable via EditableText)
    - Abstract (editable via EditableText)
    - Publication URL (editable via EditableText)
    - Action buttons (hide/restore/delete)

## Inline Editing on Public Pages

### EditableText Component

**File:** `/src/components/EditableText.tsx`

```typescript
interface EditableTextProps {
  entity: string;        // "researcher", "project", "publication", "page"
  entityId: string;      // Entity ID or page name
  field: string;         // Field name to edit
  value: string;         // Current value
  multiline?: boolean;   // textarea vs input
  as?: "p" | "span" | "div"; // Wrapper element when not editing
  className?: string;    // CSS classes
}

export default function EditableText(props: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { adminLoggedIn } = useContext(AdminContext);

  // If not admin logged in: render plain text
  if (!adminLoggedIn) {
    return <>{as || "span"} className={className}>{value}</{as || "span"}>;
  }

  // If admin logged in: render with edit button
  // On click: show form with textarea/input
  // On save: call saveTextOverride() server action
  // Show error or success message
}
```

**Behavior:**
- Normal users: see static text
- Admin logged in: see text with pencil icon + edit button
- Click edit: form appears with current value
- Submit: calls `saveTextOverride(entity, entityId, field, value)`
- On success: page re-renders with new value (via revalidatePath)
- On error: shows error message

**Used on:**
- Researcher detail pages (name, title, about, credentials)
- Project detail pages (name, about)
- Publication cards (name, journal, abstract, publicationUrl)
- Home page (subtitle, highlight description)
- About page (intro, approach, achievements)
- Join page (intro, program descriptions)

## Photo Upload

### PhotoUpload Component

**File:** `/src/components/PhotoUpload.tsx`

```typescript
interface PhotoUploadProps {
  researcherId: string;
  researcherSlug: string;
  currentPhotoUrl?: string;
}

export default function PhotoUpload({ researcherId, researcherSlug, currentPhotoUrl }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(file: File) {
    // Validate: type (jpeg, png, webp, gif), size (<5MB)
    // Call `uploadResearcherPhoto()` server action with FormData
    // On success: show new photo URL, update display
    // On error: show error message
  }
}
```

**Flow:**
1. Admin clicks photo upload button on researcher detail
2. File input opened (image types only)
3. File validated (type, size)
4. FormData created with file + researcherId + researcherSlug
5. Calls `uploadResearcherPhoto()` server action
6. Server:
   - Validates file again
   - Uploads to Vercel Blob with public access
   - Stores blob URL as text override on researcher `photo` field
   - Revalidates paths
7. Returns blob URL to client
8. Photo display updates with new image

**Constraints:**
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 5 MB
- Filename: `photos/{researcherId}-{timestamp}.{ext}`
- Public access: URL can be shared/viewed without auth

## CRUD Operations via Server Actions

### Add Operations

**Researcher:**
```
Form (add) → FormData → addResearcher() → 
  Generate ID: custom-{timestamp} →
  Insert into custom_researchers →
  Revalidate paths →
  Redirect to /admin/team
```

**Project:**
```
Form (add) → FormData → addProject() →
  Generate ID: custom-{timestamp} →
  Insert into custom_projects →
  Revalidate paths →
  Redirect to /admin/research
```

**Publication:**
```
Form (add) → FormData → addPublication() →
  Generate ID: custom-{timestamp} →
  Insert into custom_publications →
  Revalidate paths →
  Redirect to /admin/publications
```

### Hide/Restore Operations

**Static Entity (e.g., static researcher with ID "1"):**
```
Hide button →
  deletePublication/Project/Researcher(id) →
  Insert into hidden_entities (soft-delete) →
  Revalidate paths

Restore button →
  restorePublication/Project/Researcher(id) →
  Delete from hidden_entities →
  Revalidate paths
```

**Custom Entity (e.g., custom researcher with ID "custom-1712102400000"):**
```
Delete button →
  deletePublication/Project/Researcher(id) →
  Delete from custom_publications/projects/researchers (hard-delete) →
  Revalidate paths
```

### Edit Operations

**Text Field Override:**
```
Click edit on EditableText →
  Input value →
  saveTextOverride(entity, entityId, field, value) →
  Validate field is in VALID_FIELDS[entity] →
  Upsert into text_overrides →
  Revalidate path →
  Show success
```

### Alumni Operations

**Move to Alumni:**
```
Button on researcher row →
  moveResearcherToAlumni(id, name, credentials) →
  Insert into db_alumni (name, credentials) →
  Hide from active team (soft-delete or hard-delete) →
  Revalidate paths →
  Researcher moves to alumni section on /team
```

**Delete Alumni:**
```
Button on alumni row →
  deleteAlumni(alumniId) →
  Delete from db_alumni →
  Revalidate paths →
  Alumni removed from list
```

## Access Control

All admin operations require session verification:

```typescript
export async function mutationAction(...) {
  const session = await verifySession();
  if (!session) {
    return { error: "Not authenticated." };
    // or throw new Error() depending on action
  }
  // ... perform operation
}
```

If user not logged in:
- Server Action returns error
- Client shows error message
- No DB modification

If session invalid/expired:
- `verifySession()` returns null
- Action rejected
- User must log in again

## Field Validation

### Valid Fields per Entity

```typescript
const VALID_FIELDS: Record<string, Set<string>> = {
  researcher: new Set(["name", "title", "about", "photo", "credentials"]),
  project: new Set(["name", "about"]),
  publication: new Set(["name", "journal", "abstract", "publicationUrl"]),
};

const VALID_PAGE_FIELDS: Record<string, Set<string>> = {
  home: new Set(["subtitle", "highlight_desc"]),
  about: new Set([...many fields...]),
  join: new Set([...many fields...]),
};
```

Admin cannot edit:
- Invalid fields
- Invalid entities
- Invalid pages

Attempts to do so return error message.

## UI Components Used

- **Input/Textarea:** From standard HTML forms
- **Button:** Standard HTML submit/button elements
- **Link:** Next.js `<Link>` for navigation
- **EditableText:** Custom component for inline editing
- **PhotoUpload:** Custom component for photo upload
- **AnimatedSection:** Fade-in animation on scroll
- **Card components:** Display entities in lists

## Logout

Researcher/project/publication pages include logout button in top nav:
```
Button → logout() server action →
  deleteSession() →
  Redirect to home
```

Session cleared, admin UI hidden on all pages.

## Error Handling

- **Auth failures:** Display error message, stay on login page
- **Rate limiting:** Display timeout message, wait 15 minutes
- **DB errors:** Display generic error message ("Failed to save")
- **Validation errors:** Display specific error (e.g., "Invalid field")
- **File upload errors:** Display error (type, size, network)

## Performance Considerations

- Manager components fetch all entities on page load
- No pagination implemented (assumes <100 entities)
- Inline edits trigger single-field revalidation
- Photo uploads to Vercel Blob (fast, global CDN)
- Custom entity ID generation uses `Date.now()` for uniqueness
