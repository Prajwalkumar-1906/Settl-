# Settl — Production Group Expense & Smart Settlement Web Application

**Settl** is a production-grade full-stack web application designed for group expense management, graph-based debt minimization, real-time sync, and social charity impact.

---

## 🚀 Key Features & Differentiators

- 🧠 **Min Cash Flow Debt Engine**: Reduces $N$-way group debts into the absolute minimum number of direct transfers ($O(N \log N)$ greedy heap optimization).
- 🔒 **Production Authentication**: Real JWT Access Tokens + Refresh Tokens (HTTP-only cookies), password hashing (`bcryptjs`), Google OAuth integration, and password reset flow.
- 💾 **Persistent Database**: Powered by Prisma ORM (`packages/database`) supporting both PostgreSQL and SQLite.
- ⚡ **Real-Time Presence**: Socket.IO WebSockets for instant expense updates, settlement broadcasts, and live room viewer tracking.
- 🌊 **Social Impact & Eco Carbon Offset**: Optional micro round-up charity donations pledged to marine ocean funds, along with category-based carbon footprint estimates.
- 🛡️ **Security & Hardening**: Request validation with Zod schemas, Helmet headers, CORS restrictions, and rate-limiting on auth endpoints.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, React Router 6, Lucide Icons, Socket.io-client.
- **Backend**: Express, TypeScript, Socket.IO, Prisma Client, JWT, bcryptjs, Zod, Helmet, Express-Rate-Limit.
- **Database**: PostgreSQL / SQLite via Prisma ORM.

---

## ⚙️ Environment Variables

Create `.env` at the root and in `apps/server/.env` based on `.env.example`:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | Prisma database connection string | `file:./dev.db` or `postgresql://postgres:postgrespassword@localhost:5432/settl_db` |
| `JWT_SECRET` | Secret key for signing Access Tokens | `settl_jwt_secret_super_secure_key_2026` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `settl_jwt_refresh_secret_key_2026` |
| `PORT` | Backend Express server port | `4000` |
| `CLIENT_ORIGIN` | Allowed client origin for CORS | `http://localhost:3000` |
| `RESEND_API_KEY` | Transactional email provider key | *(Optional for dev, stubbed)* |

---

## 📦 Getting Started & Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Database & Seed Demo Data
```bash
# Generate Prisma Client & Sync Schema
npm --prefix packages/database run db:generate
npx --prefix packages/database prisma db push

# Seed Database with Demo Users & Groups
npm --prefix packages/database run db:seed
```

*(Optional: If running PostgreSQL via Docker Compose)*
```bash
docker compose up -d
```

### 3. Start Development Servers

- **Start Client Web App**:
  ```bash
  npm run dev:client
  ```
  *App runs at [http://localhost:3000](http://localhost:3000)*

- **Start Express Backend**:
  ```bash
  npm run dev:server
  ```
  *Server runs at [http://localhost:4000](http://localhost:4000)*

---

## 🧪 Seeding & Demo Credentials

Seeding populates the database with demo users (password for all: `admin123`):

- **Alex Rivera**: `alex@example.com` (Admin of *Paris & Swiss Alps 2026 🇫🇷*)
- **Sarah Chen**: `sarah@example.com` (Admin of *Flat 4B Apartment 🏠*)
- **Michael Vance**: `michael@example.com`
- **Priya Sharma**: `priya@example.com`
- **David Kim**: `david@example.com`

---

## 🏗️ Production Build

To test production bundle compilation:
```bash
npm --prefix apps/client run build
```
Outputs optimized static assets to `apps/client/dist`.
