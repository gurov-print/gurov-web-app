---
name: gurov-database
description: Change Gurov PostgreSQL/Drizzle schemas, repositories, transactions, and migrations in packages/database.
---

# Database
Read AGENTS.md, packages/database/src/schema, repositories, drizzle.config.ts, and the API database service. The initial schema is empty; do not restore LMS tables.

- Model only entities and invariants needed by the current task. Consider baseColumns() for new tables; export tables from schema/index.ts and the required public entrypoint.
- Set NOT NULL, foreign keys, unique constraints, and indexes according to actual rules and queries. BaseRepository does not automatically provide authorization or optimistic locking.
- Perform operations that must be atomic in one transaction; pass the same transaction executor to all involved queries. Do not keep transactions open during external AI/SMTP calls.
- When coupling a database write with job submission, explicitly handle partial failure. Choose the necessary delivery guarantee and deduplication rather than assuming PostgreSQL and Redis are atomic together.
- Generate migrations with pnpm db:generate; inspect SQL and metadata. Do not edit applied migrations or replace migrations with schema push.
- Test migrations on a disposable database and, for existing schemas, test the upgrade from the previous version. Verify the target database before db:migrate without exposing secrets. Permission to write code does not imply permission for production migrations.

Done means schema exports work, SQL has been reviewed, and constraints and transaction behavior have been tested. For destructive changes, explain data preservation and recovery or roll-forward procedures; do not promise an automatic rollback that does not exist.
