---
name: gurov-review
description: Review Gurov changes for defects, regressions, contract violations, and verification gaps without restarting an LMS audit.
---

# Review
Read AGENTS.md, the diff, and directly related consumers. Review the specific change; do not expand it into a full LMS/repository audit.

- Compare the outcome with task requirements and the actual scaffold. Do not label the absence of an unapproved frontend, authentication system, or AI checker as a regression. New access to private files must still include the required permission checks.
- Check the API envelope, runtime validation, contracts and ESM compatibility, transactions/constraints and migrations, job retries, resource limits, secret exposure, and preservation of originals.
- For AI/preflight, look for false approval on timeout/unknown, artwork version mismatches, AI inference presented as measurement, and unauthorized external uploads.
- Compare tests with behavior: mock probes do not prove PostgreSQL/Redis integration, and PDF parsing does not prove print readiness.
- Do not rewrite code for stylistic preferences alone. In review mode, do not modify files unless the user requested fixes.

Each finding must include priority, file and exact line, triggering condition, impact, and a concise direction for a fix. Distinguish demonstrated defects from questions. If no defects are found, say so explicitly and state verification limits; do not invent findings to fill the report.
