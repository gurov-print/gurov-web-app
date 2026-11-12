# Gurov Web App

Монорепозиторій на pnpm і Turborepo. Серверна архітектура перенесена з
`edu-platform` та адаптована до NestJS 12 / ESM.

## Запуск

Потрібні Node.js 24.15+, pnpm 11.15.1 і Docker.

```sh
pnpm install
cp .env.example .env
docker compose up -d
pnpm dev
```

Не перезаписуйте `.env`, якщо вже налаштували його. Значення у прикладі призначені
для локальної розробки. PostgreSQL використовує порт 5434, Redis — 6380.

- API: http://localhost:3000 (порт задає `APP_PORT`).
- Swagger: http://localhost:3000/docs — лише поза production.
- Liveness: `/health/live`.
- Readiness: `/health/ready`, також `/health` — перевіряє PostgreSQL і Redis;
  повертає 503, якщо залежність недоступна.

Кореневого маршруту `Hello World` більше немає. Бізнес-маршрути ще не додані.

## Структура

```text
apps/api/src/
  common/                 # Формат відповідей, помилки, DTO, декоратори, helpers
  config/                 # Env-валідація, HTTP adapter, CORS, Swagger, логування
  database/               # Nest-модуль доступу до БД та її життєвий цикл
  health/                 # Liveness/readiness
  infrastructure/
    email/                # SMTP transport без шаблонів входу чи запрошень
    lifecycle/            # Завершення активних запитів перед зупинкою
    logger/               # Pino, request ID, приховування чутливих полів
    media-processing/     # Обробка зображень, PDF worker, обмеження навантаження
    queue/                # BullMQ, повтори й обмежений час операцій
    rate-limit/           # Спільний Redis rate limiter
    storage/              # Локальне та S3-сховище
packages/
  contracts/              # Спільні типи API-відповідей і версій записів
  database/               # Drizzle/PostgreSQL, BaseRepository, базові колонки
```

Не перенесені React-адмінка, бізнес-моделі, їхні DTO/сервіси/контролери,
старі міграції, користувачі, ролі, permissions, сесії, JWT, паролі та запрошення.
Схема БД порожня; нові таблиці додавайте в `packages/database/src/schema`.
`baseColumns` доступні через `@gurov/database`.

## Команди

```sh
pnpm dev                # Збірка спільних пакетів і запуск API з watch
pnpm build              # Збірка пакетів у правильному порядку
pnpm lint
pnpm check-types
pnpm test               # Перевірки конфігурації, без зовнішніх сервісів
pnpm test:e2e           # HTTP-контракт із підставленими PostgreSQL/Redis probes
pnpm test:integration   # Реальні HTTP/SMTP/PostgreSQL/Redis-перевірки; потрібен Docker Compose
pnpm artifacts:clean
pnpm artifacts:check
```

`pnpm dev` збирає спільні пакети перед стартом. Після змін їхніх вихідних файлів
виконайте `pnpm build` або перезапустіть `pnpm dev`.

Для запуску готової збірки:

```sh
pnpm build
pnpm --filter @gurov/api start:prod
```

## База даних

Після додавання власних моделей та експорту таблиць зі `schema/index.ts`:

```sh
pnpm db:generate
pnpm db:migrate
pnpm db:studio
```

У цьому каркасі немає міграцій для застосування.

## Інфраструктура

Відповіді мають форму `{ status_code, detail, result, code? }`.
Глобальний ліміт — 60 запитів на хвилину; health endpoints його обходять.
При недоступності Redis обмежувані маршрути повертають 503.

Файлове сховище підтримує ключі `images/<uuid>.webp` і `documents/<uuid>.pdf`.
Файли зберігаються у `.storage/` або S3 згідно з налаштуваннями. HTTP-upload
маршрути та прив'язка файлів до моделей ще не додані.

SMTP підключається лише при надсиланні. Налаштуйте `SMTP_*` для потрібного
поштового сервера; Compose містить лише PostgreSQL та Redis. Порожні
`SMTP_USER`/`SMTP_PASSWORD` підтримують локальний SMTP без авторизації.
S3-запити також виконуються лише при використанні сховища.

Черги `email` і `media` мають спільну конфігурацію, але бізнес-процесорів немає.
Нові worker queues реєструйте у відповідних функціональних модулях.

У CI використовуйте `pnpm install --frozen-lockfile`. Змінні, які впливають
на майбутні збірки, додайте до `build.env` у `turbo.json`.
