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