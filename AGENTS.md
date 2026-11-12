# Agent instructions for Gurov

## Product and sources of truth
This is an independent print-shop automation project. An AI checker for prepress artwork is a possible direction, not an implemented or fully agreed feature.
Before making changes, read README.md, the relevant package.json files, applicable AGENTS.md files, and relevant code. See docs/agent-context.md for the current baseline and open decisions.
The base architecture has already been adapted from edu-platform. Use the implementation here; consult the LMS only for a specific missing technical decision. Do not restart its audit or import courses, lessons, LMS roles, permissions, sessions, or old migrations.

## Responsibilities
Skills describe workflows, not mandatory separate agent processes. One agent may use several skills. Do not run parallel agents unless the user requests it.

| Area | Skill | Responsibility boundary |
| --- | --- | --- |
| NestJS, HTTP, application logic | .agents/skills/gurov-backend/SKILL.md | apps/api; coordinate schema changes with the database skill |
| UI and API client | .agents/skills/gurov-frontend/SKILL.md | planned apps/web (Next.js public site and admin); no browser secrets or database access |
| PostgreSQL, Drizzle, migrations | .agents/skills/gurov-database/SKILL.md | packages/database; does not define HTTP behavior |
| Files, queues, external services, AI | .agents/skills/gurov-integrations-ai/SKILL.md | adapters and workers; does not independently decide print readiness |
| Behavioral verification | .agents/skills/gurov-testing/SKILL.md | tests proportional to the risk of the change |
| Change review | .agents/skills/gurov-review/SKILL.md | concrete defects and gaps; fixes only within the requested scope |

Assign one owner for the end-to-end outcome of a cross-cutting task. Define the contract and acceptance criteria before the schema/service/UI. Verify packages/contracts changes in every consumer. Handoffs must identify files, contracts, decisions, checks, and unresolved questions.

## Shared rules
- Preserve the existing pnpm/Turborepo workspace and @gurov/* names. Obtain versions and commands from manifests and the lockfile; do not substitute LMS conventions.
- The API uses ESM and .js extensions in relative imports. Import shared types through package public APIs; contracts must not depend on NestJS, database, or frontend.
- The shared HTTP envelope is { status_code, detail, result, code? }. Do not wrap responses twice; preserve the StreamableFile exception and check specialized health behavior.
- HTTP input validation uses DTOs and the global ValidationPipe. Add environment variables through the existing configuration/validation, .env.example, and relevant turbo.json rules. Do not read or copy secrets for documentation.
- Do not invent business statuses, access rights, print specifications, or retention policies. Ask a focused question when uncertainty blocks implementation; continue independent work.
- Preserve others' uncommitted changes. Avoid unrelated bulk formatting, resets, cleanup, or dependency upgrades. Do not edit generated dist/build files.
- Real-data migrations, deployment, sending messages, and transferring customer artwork to external AI require corresponding user authorization. Continue ordinary local edits and tests within the task without repeated approval requests.
- Write agent instructions and skills in English. Respond to the user in the conversation's language unless they request otherwise.

## Definition of done
The implementation meets the task's acceptance criteria; update public contracts and documentation where needed. Run relevant checks from the testing skill. For Markdown-only changes, verify paths, commands, frontmatter, and consistency; a full build is unnecessary.
Run pnpm artifacts:check before finishing. Inspect any duplicate files found before taking action; do not run unnecessary automatic deletion in someone else's working tree.
Report the outcome, checks performed, and anything not verified with the reason. Do not equate a passing mock test with verification of a real integration.
