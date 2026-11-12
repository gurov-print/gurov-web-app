---
name: gurov-testing
description: Select and run Gurov unit, HTTP e2e, and integration checks. Use for behavioral changes or testing requests.
---

# Testing
Read AGENTS.md, scripts in the relevant package.json files, and .github/workflows/ci.yml. Test observable behavior and regression risks, not implementation wording.

| Change | Checks |
| --- | --- |
| Instructions/Markdown only | Skill frontmatter, valid references, commands matching scripts, pnpm artifacts:check |
| API/shared types | pnpm build, pnpm lint, pnpm check-types, pnpm test; HTTP contracts: pnpm test:e2e |
| SQL/storage/Redis/SMTP/HTTP adapter/lifecycle | Relevant preceding checks plus pnpm test:integration with test dependencies |
| Frontend | Actual scripts of the new/existing workspace and UI checks; the workspace is initially absent |

- Unit: apps/api/src/**/*.spec.ts, Vitest; e2e: apps/api/test/**/*.e2e-spec.ts, Vitest with stubbed probes. Integration: apps/api/test/*.integration.cjs, Node test runner, real PostgreSQL/Redis and local fixtures according to test configuration.
- Shared packages build into dist: build contracts/database changes before dependent tests. Root pnpm build handles dependency order through Turbo.
- pnpm test:integration requires a built application and test dependencies. Verify database/Redis targets before running it. Do not clear development or production data; use isolated test resources and remove only data created by the tests.
- For a bug fix, add a check that reproduces the previous failure. For a new feature, test the main outcome, invalid input, and relevant failure/concurrency cases.
- Run pnpm artifacts:check after builds/tests. Do not rerun the entire suite without a new change or unresolved issue.

Report the command, result, behavior checked, and skipped checks with reasons. If dependencies are unavailable, disclose the limitation; do not silently replace integration checks with mocks or claim everything was verified.
