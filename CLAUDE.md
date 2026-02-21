# Project: Sync (Multi-Agent Split-Screen Orchestrator)

- **Stack:** Next.js (App Router), React, Tailwind CSS, TypeScript, `@xyflow/react` (React Flow), `framer-motion`, `use-sound`.
- **Theme:** "Many-to-Many Orchestration." Left side is the Human Boardroom. Right side is an interactive Agent Node Graph.
- **Scenario:** Zero-Downtime Database Migration (Postgres to DynamoDB).
- **Design System:** Ultra-sleek, premium dark mode (`bg-zinc-950`). Use `backdrop-blur-md` and subtle borders (`border-white/10`).
- **Mocking Strategy:** Use `setTimeout` and `setInterval` to simulate live agent work (typing code, running migrations).
- **AI Integration:** Use `@ai-sdk/anthropic` (model: `claude-opus-4-6`) in an API route (`/api/synthesize`) to evaluate the human chat and extract the JSON Epic.
