# HR Life‑Insurance Micro‑services ( Bun + Prisma )

A set of four back‑end micro‑services, plus an HTTP gateway, that handle the
“change life‑insurance beneficiary” workflow for a company’s HR department.

| Service                  | Port | DB name         | Tables (Prisma model)                |
| ------------------------ | ---- | --------------- | ------------------------------------ |
| **admin‑service**        | 3005 | `admin-service` | `Employe`, `ConseillerRH`            |
| **hr‑service**           | 3001 | `hr-service`    | `Beneficiaire`, `CompagnieAssurance` |
| **file‑service**         | 3002 | `file-service`  | `DossierClient`                      |
| **notification‑service** | 3003 | – (no DB)       | —                                    |
| **gateway**              | 8080 | –               | Reverse‑proxy / landing page         |

Each service is an **ES‑module Bun app** using **Prisma ORM**
and exposes interactive docs at `/api-docs` (Swagger UI).

---

## 1. Prerequisites

| Tool       | Version                               |
| ---------- | ------------------------------------- |
| **Bun**    |  ≥ 1.1                                |
| PostgreSQL | 14 / 15                               |
| Docker     | optional – only if you prefer Compose |

> **Ubuntu example:**
>
> ```bash
> curl -fsSL https://bun.sh/install | bash
> sudo apt install postgresql
> ```

---

## 2. Clone & install

```bash
git clone https://github.com/your‑org/hr-life-insurance.git
cd hr-life-insurance

# install all root dev‑deps (concurrently, prisma cli, etc.)
bun install
```

### Install per‑service deps (first time only)

```bash
bun install --cwd gateway
bun install --cwd services/admin-service
bun install --cwd services/hr-service
bun install --cwd services/file-service
bun install --cwd services/notification-service
```

---

## 3. PostgreSQL configuration

Create three databases (change credentials as you like):

```bash
sudo -u postgres psql <<'SQL'
CREATE USER hr_user WITH PASSWORD 'hr_pass';
CREATE DATABASE "admin-service"     OWNER hr_user;
CREATE DATABASE "hr-service"        OWNER hr_user;
CREATE DATABASE "file-service"      OWNER hr_user;
SQL
```

---

## 4. Environment variables

Create **one `.env` file in each service folder**.

<details>
<summary>admin‑service/.env (example)</summary>

```env
DATABASE_URL=postgresql://hr_user:hr_pass@localhost:5432/admin-service
```

</details>

<details>
<summary>hr‑service/.env</summary>

```env
DATABASE_URL=postgresql://hr_user:hr_pass@localhost:5432/hr-service
ADMIN_URL=http://localhost:3005
FILE_URL=http://localhost:3002
NOTIFY_URL=http://localhost:3003/beneficiary-change
SMTP_HOST=localhost
SMTP_PORT=25
FROM_EMAIL=HR Corp <noreply@corp.local>
```

</details>

<details>
<summary>file‑service/.env</summary>

```env
DATABASE_URL=postgresql://hr_user:hr_pass@localhost:5432/file-service
```

</details>

Notification‑service needs no DB vars.

---

## 5. Generate Prisma clients & run migrations

```bash
bunx prisma generate   --cwd services/admin-service
bunx prisma migrate deploy --cwd services/admin-service

bunx prisma generate   --cwd services/hr-service
bunx prisma migrate deploy --cwd services/hr-service

bunx prisma generate   --cwd services/file-service
bunx prisma migrate deploy --cwd services/file-service
```

---

## 6. Start the stack (dev)

```bash
bun run dev
```

`bun run dev` invokes **concurrently**:

```
gateway               : http://localhost:8080
admin-service         : :3005
hr-service            : :3001
file-service          : :3002
notification-service  : :3003
```

Hot‑reload is handled by **bun --watch**.

---

## 7. Swagger / OpenAPI

-   http://localhost:8080/admin/api-docs
-   http://localhost:8080/hr/api-docs
-   http://localhost:8080/file/api-docs
-   http://localhost:8080/notify/api-docs

---

## 8. Production (Docker)

Each service contains a Dockerfile. Build & run:

```bash
docker compose up --build
```

Configure each `DATABASE_URL` in compose to point to your Postgres.

---

## 9. Contribution guidelines

1. Branches: `main` (stable) / `dev` (active).
2. Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`).
3. Before PR: run linter, tests, update Swagger docs.
4. DB changes: edit the correct `schema.prisma` → `bunx prisma migrate dev`.

Welcome! Feel free to open issues or PRs.
