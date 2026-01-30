# Development Policy

## TypeScript Coding Guidelines

### File and Folder Naming
- Use kebab-case for all file names and folder names.
  - ✅ Good: `user-handler.ts`, `api-client-utils/`, `data-processors/`
  - ❌ Bad: `userHandler.ts`, `ApiClient.ts`, `DataProcessors/`, `apiClientUtils/`

### Functions
- Prefer arrow functions (`const fn = () => {}`) over function declarations.
  - ✅ Good:
    ```typescript
    const handleUserRequest = (id: string) => {
      // implementation
    };
    ```
  - ❌ Bad:
    ```typescript
    function handleUserRequest(id: string) {
      // implementation
    }
    ```

## React Router v7 File-Based Routing Conventions

This project uses **folder-based routing** structure. Follow these conventions strictly to avoid route collisions.

### Routing Structure Rules

#### Folder-Based Structure (Standard)
Use folders for route organization. For nested routes with layouts:

```
app/routes/
  parent/
    route.tsx           → /parent (layout)
  parent._index/
    route.tsx           → /parent (index page)
  parent.child/
    route.tsx           → /parent/child
```

**Key Points:**
- Layout file: `parent/route.tsx` creates the `/parent` layout
- Index route: `parent._index/route.tsx` (sibling to `parent/`, NOT inside it)
- Child routes: `parent.child/route.tsx` uses dot notation

#### ❌ Common Mistakes to Avoid

**Wrong:** Index inside parent folder
```
parent/
  route.tsx
  _index/              ❌ WRONG - Will create /parent/_index
    route.tsx
```

**Correct:** Index as sibling with dot notation
```
parent/
  route.tsx
parent._index/         ✅ CORRECT - Creates /parent
  route.tsx
```

#### Pathless Layouts
Use leading underscore (`_`) for layouts that don't add URL segments:

```
app/routes/
  _auth/
    route.tsx           → No URL segment (pathless layout)
  _auth.login/
    route.tsx           → /login (uses _auth layout)
  _auth.register/
    route.tsx           → /register (uses _auth layout)
```

### Real Examples from This Project

**Main App (Pathless Layout):**
```
_app/
  route.tsx             → Pathless layout
_app._index/
  route.tsx             → / (root index)
_app.privacy-terms/
  route.tsx             → /privacy-terms
```

**Clean Mode (With URL Path):**
```
clean/
  route.tsx             → /clean (layout)
clean._index/
  route.tsx             → /clean (index)
```

### Verification
Always verify routing structure with:
```bash
npm run check
```

Watch for warnings like:
```
⚠️ Route Path Collision: "/"
```

### Reference
Official documentation: https://reactrouter.com/how-to/file-route-conventions

## Branch Strategy
- `main`: Production-ready code
- Feature branches: `feature/description`, `bug-fix/description`, `add-description`
- Branch from `main`, merge back via PR

## Commit Messages
- Use descriptive messages in English
- Reference issue numbers when applicable
- Examples: "Add ad-free mode toggle", "Fix playlist sync conflict"

## Code Quality
- Run `npm run check` before committing (Biome format + typecheck)
- Fix all TypeScript errors
- Husky pre-commit hooks enforce formatting