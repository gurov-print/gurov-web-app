---
name: gurov-frontend
description: Build or change the Gurov Next.js App Router public website, administrative interfaces, and API client in apps/web. Use for frontend architecture and UI tasks.
---

# Frontend
Read the root AGENTS.md, docs/agent-context.md, and docs/frontend-architecture.md before changing frontend code. The agreed baseline is one Next.js App Router application in apps/web (@gurov/web), with separate public and administrative layouts. Do not ask the user to choose a framework again. Check what is actually implemented before making changes; an agreed architecture is not a completed scaffold.

## Structure and boundaries
- Follow the route and dependency boundaries in docs/frontend-architecture.md. app composes pages; features contains task-specific UI behavior; shared components/lib must not depend on features.
- Keep public navigation separate from the administrative shell. Build functional modules and compose task-specific screens; do not duplicate the application for each role.
- Roles, tasks, permission names, and assignments are still open. Do not invent them or create speculative feature directories. Ask only when an unresolved decision blocks the current task.
- Use @gurov/contracts and the NestJS HTTP API. Do not import @gurov/database into Next.js, including server code; do not import server DTOs, Drizzle, or secrets into the browser.
- Keep business rules, authoritative validation, authorization, storage, queues, and AI execution in NestJS. Add Route Handlers/Server Actions only for a concrete frontend-specific need.

## Rendering and data
- Use Server Components for appropriate pages/layouts and Client Components for interaction. Keep client boundaries narrow and mark secret-bearing server modules as server-only.
- Separate browser and server API entrypoints. Server Components call NestJS directly; do not route them through the application's own HTTP handlers. Follow the architecture document's deployment proposal only after hosting/auth details are resolved.
- Centralize HTTP envelope handling: detail holds the payload, result is success/error, and code is optional. Handle network errors, file transfers, and 503/429 responses according to the actual contract.
- Keep filters/sorting/pagination in the URL, transient UI state local, and form state in the form. Choose a clear owner and refresh policy for remote data on each screen; do not introduce a state library without a concrete need.
- Use explicit fresh-data behavior for private administrative reads initially. Any added cache must define its user scope and invalidation; keep private results isolated between users.

## Access and experience
- Distinguish access to a feature, visibility of records, and allowed actions on each record. Use agreed capabilities for UI decisions; NestJS remains the authority. Hidden controls and layout redirects are not access enforcement.
- Cover loading, empty, success, error, retry, and service-unavailable states. For background tasks, display server state; completed upload does not mean completed validation.
- Do not declare artwork print-ready solely because of a positive AI response. Show the finding's source, uncertainty, and required operator action according to the agreed contract.
- Preserve existing UI components and styles. Check keyboard navigation, focus, labels, readable messages, and narrow screens. Keep shared UI local until another actual application needs it.

## Completion checks
For implementation, verify the affected public/admin workflow in a browser, reproduce error/empty states, and align contract types. Test direct route access and relevant authorization failures once authentication is implemented. When scaffolding is requested, add actual frontend scripts to the workspace verification workflow; do not claim UI tests exist before they do.
For architecture/skill-only edits, check documentation consistency, references, and frontmatter, then run pnpm artifacts:check. Do not scaffold the frontend or run nonexistent frontend commands as part of a documentation-only task.
