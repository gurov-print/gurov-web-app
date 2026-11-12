# Gurov API

NestJS 12 / ESM із native Node HTTP adapter, конфігурацією, логуванням,
health endpoints, Drizzle/PostgreSQL, Redis rate limiting, BullMQ, SMTP,
локальним/S3 сховищем та обробкою зображень/PDF.

Запуск із кореня монорепозиторію: `pnpm dev:api`.
Перед цим налаштуйте кореневий `.env` за `.env.example` та запустіть PostgreSQL/Redis.

Swagger: `/docs`, JSON: `/docs-json` (поза production).
Health: `/health/live`, `/health/ready`.

Моделей і автентифікації немає. Нові функціональні модулі додавайте в `src/`
та реєструйте в `AppModule`. Спільні інфраструктурні модулі лежать у
`src/infrastructure/`, таблиці — у workspace-пакеті `@gurov/database`.

Повні команди та налаштування описані в [кореневому README](../../README.md).
