# Kyoty

An AI-powered global community planning platform where users can browse, plan, and execute real-world meetups, trips, and events. Built with Next.js 14, Clerk, SQLite (`better-sqlite3`), and OpenAI.

## Features
- **Public Browsing:** Browse created plans without an account.
- **AI Planning:** A WhatsApp-style chat interface powered by OpenAI that sequentially asks questions until it can build a structured plan.
- **Authentication:** Hosted securely using Clerk.
- **Group Chat:** Real-time (simulated via caching MVP) messaging for accepted participants.
- **Join Workflow:** Hosts approve or reject user requests.

## Setup Instructions

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Environment Variables**
Copy the \`.env.example\` file to \`.env\` and fill it out:
\`\`\`bash
cp .env.example .env.local
\`\`\`

3. **Initialize Database**
The app runs on SQLite. Run the initialization script to create tables:
\`\`\`bash
node scripts/init-db.js
\`\`\`

4. **Run the Server**
\`\`\`bash
npm run dev
\`\`\`

## Architecture Notes
To easily support migration to Postgres in the future, all database access is abstracted via the **Repository Pattern** found in `src/lib/repositories/`.

- `LAUNCH_ROADMAP.md` details the 30-day go-to-market plan.
- `MIGRATION_PLAN.md` documents the upcoming move to Postgres.
- `LANGCHAIN_DESIGN.md` shows how the AI layer can evolve.
