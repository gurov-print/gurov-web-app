# Agent context

Verified against the code on 2026-11-11. This is a baseline snapshot: if it differs from the current implementation, inspect the code and update this document within the task's scope.

## Confirmed baseline
- pnpm workspaces apps/* and packages/*, with Turborepo; root package.json specifies pnpm 11.15.1 and Node >=24.15.0.
- apps/api is @gurov/api, using NestJS 12 / ESM and a custom ApplicationHttpAdapter over @nestjs/platform-node. Do not assume Express/Multer APIs.
- packages/contracts is @gurov/contracts: ApiResponse and record versions.
- packages/database is @gurov/database: PostgreSQL/Drizzle, BaseRepository, and baseColumns. schema/index.ts is empty; there are no business tables or migrations.
- HTTP bootstrap: apps/api/src/config/http.config.ts; environment configuration: apps/api/src/config/environment.*; shared filter/interceptor: apps/api/src/common.
- infrastructure includes SMTP, local/S3 storage, PDF/image processing, BullMQ, a Redis rate limiter, logging, and lifecycle management. Email/media producers exist; business workers do not yet exist.
- Frontend, business routes, HTTP upload, and authentication are not yet implemented. CORS does not imply access control.
- ImageProcessor resizes images and converts them to WebP. It is not storage for original print artwork. PDF validation checks parsing and limits, not complete prepress readiness.
- CI: .github/workflows/ci.yml. Unit tests: Vitest src/**/*.spec.ts; HTTP e2e: test/**/*.e2e-spec.ts with stubbed dependency probes; integration: Node test/*.integration.cjs with real dependencies.

## LMS source
README confirms that the foundation was transferred from edu-platform. When these instructions were prepared, the neighboring ../edu-platform was available with a pnpm workspace and corresponding HTTP filter/interceptor. Availability was checked without repeating the audit. This is a local path, not a Gurov dependency or CI requirement. Do not automatically copy its package scripts, versions, authentication, or business models.

## Agreed frontend architecture
On 2026-11-12, the user confirmed Next.js for a public website and an administrative workspace with task-specific interfaces. Use one App Router application in apps/web (@gurov/web), separate layouts, and feature-based modules. See docs/frontend-architecture.md for boundaries, proposed routes, data ownership, and access rules. This records an architecture decision, not an implemented frontend. Roles and concrete workflows will be clarified with the project owner.

## Product decisions needed before the relevant implementation
- The first print-shop feature, its users, and access rules.
- Frontend UI conventions/libraries, authentication/session design, initial modules, and deployment details; the framework and workspace location are already agreed.
- Whether the AI checker belongs in the first release and which results require an operator's decision.
- Original file formats, storage volume and retention, order specifications, and numerical print tolerances.
- AI provider, permission to transfer artwork, budget, and processing deadlines.
Do not let these questions block independent tasks or turn possible features into requirements without confirmation.
