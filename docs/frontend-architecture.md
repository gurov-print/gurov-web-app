# Frontend architecture

Status: agreed baseline, 2026-11-12. This document defines the intended architecture; it does not mean the frontend has been implemented.

## Application and routes
Use one Next.js App Router application in apps/web, named @gurov/web, within the existing pnpm/Turborepo workspace. It serves a public website and an administrative workspace with task-specific interfaces. Use separate layouts for these areas and share UI primitives and API infrastructure.

Planned structure (create directories only when needed):

```text
apps/web/src/
  app/
    layout.tsx                 # Shared root layout
    (public)/
      layout.tsx               # Public navigation and footer
      page.tsx                 # /
    (auth)/
      login/
        page.tsx               # /login
    (workspace)/
      admin/
        layout.tsx             # Administrative shell
        page.tsx               # /admin landing screen
  features/
    <feature>/
      api/
      components/
      hooks/
      schemas/
  components/
    ui/
    public/
    workspace/
  lib/
    api/
      client.ts
      server.ts
      errors.ts
    auth/
    config/
```

Parenthesized route groups do not contribute URL segments. Keep the shared root layout neutral; public navigation and administrative providers belong in their respective areas. Add administrative feature routes below /admin when the workflows are defined. The login route reserves a location, not a decision about the authentication mechanism.

## Module boundaries
- app composes routes, layouts, loading states, error boundaries, and feature modules. Keep feature behavior out of route files where it would obscure these responsibilities.
- features groups UI behavior by product capability, not by role. Add only modules required by agreed tasks; example names such as orders or preflight are not requirements.
- Shared components and lib must not depend on feature modules. Avoid importing another feature's internal files; define an explicit public interface when cross-feature composition is needed.
- Keep shared UI in apps/web initially. Extract packages/ui only when a second actual consumer justifies it.
- Next.js owns presentation, interaction, and frontend data loading. NestJS owns business rules, authoritative validation and access checks, database transactions, storage, queues, and AI processing.
- Next.js must not import @gurov/database, including in server code. Use the NestJS HTTP API and @gurov/contracts. Keep server DTOs and backend framework dependencies out of frontend contracts.

## Server and client execution
Use Server Components for pages/layouts and data loading where appropriate. Use Client Components for forms, interactive tables, uploads, artwork viewers, and browser APIs. Keep client boundaries narrow instead of marking the entire shell as client-side for one interactive control.

Separate server-only API/auth/config code from browser-safe code. Mark lib/api/server.ts and other secret-bearing modules with server-only boundaries. Forward only the credentials needed by the API for the current request; do not expose server secrets to the browser or forward all incoming headers indiscriminately.

Route Handlers and Server Actions may provide a concrete frontend-specific server function. Do not duplicate NestJS business services or create a mandatory pass-through handler for every endpoint. Server Components should call NestJS directly rather than making a round trip through the application's own HTTP handlers.

## API, state, and freshness
Centralize the existing API envelope: detail is the payload, result is success/error, and code is optional. Handle non-JSON/file responses and network failures separately.

- Put shareable filters, sorting, and pagination in the URL.
- Keep temporary interaction state, such as open dialogs, local to React components.
- Keep form values and errors within the form's state mechanism.
- Define one owner for each screen's remote data and an explicit refresh/invalidation path after mutations. Avoid unsynchronized server and client copies of the same data.
- Start private administrative data reads with explicit fresh-data behavior. Add caching only with a defined scope and invalidation policy; never share user-specific results across users.
- Decide public-content rendering, SEO, and caching per page and content source. Administrative and public content need not share a cache policy.
- For background operations, display the server-reported state. Upload completion is not processing completion.

The proposed deployment topology is one public origin: / routes to Next.js and /api/* routes to NestJS through a reverse proxy; Next.js server code uses an internal API address. This is a deployment proposal, not existing configuration. Confirm hosting, path mapping, authentication cookies, and request protection before implementation.

## Roles and task-specific interfaces
Build functional modules and compose appropriate screens/navigation for each workflow. Do not duplicate the entire administration application for each role.

Distinguish capability access, record-level visibility, and actions allowed on a particular record in its current state. Roles may group permissions; feature behavior should depend on agreed capabilities rather than scattered role-name comparisons. Exact roles, permission names, and assignments remain undecided.

NestJS must enforce authorization for every relevant request. Frontend checks improve navigation and feedback but do not secure the API. Layout redirects alone do not replace authorization. Do not invent role presets, permission lists, or a session/token protocol while implementing unrelated UI.

## Verification and open decisions
Verify public and administrative layouts separately, direct navigation to protected routes, relevant loading/empty/error states, keyboard access, and narrow-screen behavior. Once authentication exists, verify unauthorized and forbidden API outcomes as well as role-appropriate UI. Add actual frontend build, lint, type-check, and test scripts to the workspace workflow when scaffolding; those commands do not exist yet.

Still open: roles and workflows, initial feature modules, authentication/session design, UI library and styling, form/data-fetching libraries, public content management, hosting, and exact dependency versions. Confirm only decisions required by the current implementation task. This architecture does not authorize scaffolding or implementing product features by itself.
