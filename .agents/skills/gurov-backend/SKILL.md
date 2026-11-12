---
name: gurov-backend
description: Develop the Gurov NestJS API, DTOs, services, HTTP contracts, and configuration. Use for changes in apps/api.
---

# Backend
Read the root AGENTS.md, docs/agent-context.md, and the closest existing implementation.

- Controllers handle HTTP, DTOs, and service calls; services hold application rules; SQL and persistence belong in the data access layer. Name new feature modules after print-shop tasks, not LMS concepts.
- Reuse EnvironmentService, DatabaseService, global filters/interceptors, and DI. Do not create a second bootstrap, connection pool, or local error format.
- Return the payload that the global interceptor places in detail. Keep public types in contracts without Nest/Drizzle dependencies; keep class-validator runtime DTOs on the server. TypeScript types do not replace runtime validation.
- Account for the custom HTTP adapter. Verify middleware/upload compatibility with the installed adapter before importing an Express example.
- For concurrent editing, inspect existing expected-version helpers; a version field alone does not provide an atomic check. Coordinate data and contract changes with the database skill.
- BullMQ is already configured. Add a worker only for a concrete background operation, using the integrations-ai skill. Do not move ordinary CRUD to a queue without a reason.
- Determine required authorization for routes exposing customer data. Do not assume it already exists or copy LMS authentication as the print shop's finished access model.

Done means verifying the successful path, invalid input, HTTP envelope/status codes, required access restrictions, and dependency failures. Verify global HTTP changes with existing e2e and relevant integration tests.
