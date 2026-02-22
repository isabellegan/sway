# Sway
### Agentic Orchestration
*Human consensus. Machine execution.*  


## Problem
Autonomous AI agents lack the architectural context and safety guardrails to modify production infrastructure directly. Letting AI swarms write and deploy code in a vacuum creates unacceptable enterprise risk.  

## Solution
**Sway** is a governed orchestration platform. It provides a collaborative command center that translates human boardroom consensus into pre-verified agent workflows, ensuring complex deployments are fully audited before hitting production.  


## Key Features
* **The Boardroom (Human Consensus):** A real-time, multi-stakeholder interface where Engineering, Product, Security, and Legal align on architectural decisions before any code is written.
* **The Factory Floor (Machine Execution):** A visual, node-based Swarm Control Plane built with React Flow. Watch autonomous agents (Gateway, Lock, and DLQ) architect solutions concurrently.
* **Simulation-First Deployments:** Agents draft infrastructure changes in an isolated `ENV: SIMULATION` state. Code is never pushed to production without human review.
* **Human-in-the-Loop Refactoring:** A built-in PR Approval workflow. Reject AI-generated architecture, provide natural language feedback (e.g., *"Extract hardcoded TTLs to environment variables"*), and watch the swarm iteratively refactor.
* **Live Telemetry:** Real-time visualization of post-deployment infrastructure metrics to verify the agent's impact on production.  

## Scenario: Solving High-Concurrency Race Conditions
For this MVP, Sway demonstrates solving a catastrophic Sev-1 e-commerce incident: a database race condition causing inventory overselling. 

Through human-agent collaboration, Sway architects and deploys a distributed systems fix:
1. **The Distributed Lock:** Implementing a Redis `SETNX` strategy to ensure atomicity across horizontally scaled pods.
2. **The Watchdog Heartbeat:** Preventing deadlocks with a background thread that dynamically extends the lock TTL while the server is actively processing.
3. **Redlock Quorum & Fencing Tokens:** Eliminating single points of failure by achieving consensus across 5 independent Redis nodes, and utilizing strictly increasing Fencing Tokens to mathematically guarantee database safety even during severe CPU/Garbage Collection pauses.  


## Tech Stack
* **Framework:** Next.js (App Router), React, TypeScript
* **Styling:** Tailwind CSS, Framer Motion (Animations)
* **Agentic Graph:** `@xyflow/react` (React Flow)
* **Telemetry Visualization:** Recharts
* **AI Integration:** `@ai-sdk/anthropic` (Opus 4.6 logic simulation)
* **UI/UX:** `use-sound` (haptics), custom SVG generation, glassmorphic overlays  


## Running Locally

1. Clone the repository:
   ```bash
   git clone [https://github.com/isabellegan/sway.git](https://github.com/isabellegan/sway.git)
   cd sway

2. Install dependencies:
   ```bash
   npm install
   
3. Start the development server:
   ```bash
   npm run dev
   
4. Open http://localhost:3000 in your browser to enter the Boardroom.
