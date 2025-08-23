# Next.js Project

A clean, step‑by‑step guide to set up, run, and deploy your app. Built with ❤️ using Next.js.

---

## ✨ What’s inside

* [Prerequisites](#prerequisites)
* [Quick Start](#quick-start)
* [Database Setup (MySQL/XAMPP)](#database-setup-mysqlxamp)
* [Environment Variables](#environment-variables)
* [Run the App](#run-the-app)
* [Project Structure](#project-structure)
* [Available Scripts](#available-scripts)
* [Troubleshooting](#troubleshooting)
* [Learn More](#learn-more)
* [Deployment](#deployment)
* [Contributing](#contributing)

---

## Prerequisites

Make sure you have the following installed:

* **Node.js** ≥ 16 (recommend the latest LTS)
* **Git** for cloning the repository
* **MySQL** (via **XAMPP** or native install)

> **Tip:** If you prefer a CLI, you can use the MySQL command‑line tools instead of phpMyAdmin.

---

## Quick Start

```bash
# 1) Clone the repo
git clone https://github.com/kairith/pttcl_system_helpdesk.git
cd the project name

# 2) Install dependencies (choose one)
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

> Continue with [Database Setup](#database-setup-mysqlxamp) and [Environment Variables](#environment-variables), then [Run the App](#run-the-app).

---

## Database Setup (MySQL/XAMPP)

1. **Download the database dump**
   From Google Drive: [https://drive.google.com/file/d/19QoUaBChegaqiHtL4ZKAXKzOdjgjF6G3/view?usp=drive\_link](https://drive.google.com/file/d/19QoUaBChegaqiHtL4ZKAXKzOdjgjF6G3/view?usp=drive_link)

2. **Start MySQL**
   Open XAMPP and start the **MySQL** service (or start your local MySQL server by any other method).

3. **Create and import the database**

   * **phpMyAdmin:** Create a new database → Import → choose the downloaded SQL file.
   * **CLI alternative:**

     ```bash
     mysql -u <USER> -p -e "CREATE DATABASE <DB_NAME> CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
     mysql -u <USER> -p <DB_NAME> < path/to/downloaded_dump.sql
     ```

4. **Update DB config in the app**
   In your project’s database/config file (e.g., `config.js`, `.env`, or an ORM config), set:

   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=<YOUR_USERNAME>
   DB_PASSWORD=<YOUR_PASSWORD>
   DB_NAME=<DB_NAME>
   ```

> **Note:** Replace placeholders with your local values. If you use an ORM (Prisma/Sequelize/Drizzle), also update its schema/config as needed.

---

## Environment Variables

1. **Download the base `.env` file**
   From Google Drive: [https://drive.google.com/file/d/1uvhZVe3FX6hrD5E7WbTIM0gE3T-FddBB/view?usp=sharing](https://drive.google.com/file/d/1uvhZVe3FX6hrD5E7WbTIM0gE3T-FddBB/view?usp=sharing)

2. **Place and rename**
   Save it to the **project root** (same level as `package.json`) and ensure the filename is exactly `.env`.

3. **Customize values**
   Open `.env` and update values for your local setup (DB credentials, API keys, etc.).

> **Security reminder:** Never commit `.env` or secrets to version control.

---

## Run the App

```bash
# start the dev server
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open [http://localhost:3000](http://localhost:3000).

* Start editing at `app/page.tsx` — hot‑reload is enabled.
* This project uses `next/font` to optimize and load **Geist**, a modern font family by Vercel.

---

## Project Structure

*A typical Next.js (App Router) layout; files may vary by project.*

```
.
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── (routes...)
├── components/
├── lib/               # utils, DB clients, helpers
├── public/
├── styles/
├── .env               # local only (not committed)
├── next.config.js
├── package.json
└── README.md
```

---

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server (after build)
npm run start

# Type check (if TypeScript)
npm run type-check

# Lint
npm run lint
```

---

## Troubleshooting

* **Port 3000 already in use** → Stop the other process or run `PORT=3001 npm run dev`.
* **Unable to connect to MySQL** → Confirm MySQL is running, credentials in `.env` are correct, and your user has permissions.
* **Import errors** → Ensure the SQL dump matches your MySQL version/charset and the database actually exists.
* **ENV not loaded** → Confirm `.env` is in the project root and variables match what your code expects.

---

## Learn More

Helpful resources:

* **Next.js Docs:** [https://nextjs.org/docs](https://nextjs.org/docs)
* **Interactive Tutorial:** [https://nextjs.org/learn](https://nextjs.org/learn)
* **Next.js GitHub:** [https://github.com/vercel/next.js](https://github.com/vercel/next.js)

---

## Deployment ( Optional )

Deploy on **Vercel** for the best developer experience.

1. Create an account at [https://vercel.com](https://vercel.com) and import your repository.
2. Add the same environment variables in the Vercel project settings.
3. Click **Deploy**.

For more options, see the official Next.js deployment docs: [https://nextjs.org/docs/app/building-your-application/deploying](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Contributing

Contributions are welcome! Open an issue or submit a PR.

---

> *Have ideas to tailor this README to your stack (Prisma/Sequelize, Docker, CI, etc.)? Let’s refine it!*
