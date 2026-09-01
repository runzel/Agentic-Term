# Agentic Term

AI-powered cross-platform terminal built with Tauri and React. Agentic Term combines local RAG (Second Brain), configurable AI assistants, and workflow automation so developers can search local documentation, generate and run commands, and orchestrate repeatable tasks — all locally.

### Status
SYSTEM_STATUS: ONLINE

### Key features
- Tabbed terminal sessions via Ghostty
- AI Assistant (local & cloud models: Unsloth, Codex, Claude)
- Second Brain: local offline document search (RAG)
- Haxor Skills: AI-suggested executable workflows
- Embedded SQLite for local credential and state storage

### Quick start
1. Install dependencies:
   ```bash
   npm ci
   ```
2. Start the app (developer mode):
   ```bash
   npm run tauri:dev
   ```
   or, to build a production bundle:
   ```bash
   npm run tauri:build
   ```

### Configuration
- Copy `.env.example` to `.env` and set any required API keys or local model endpoints.
- See `src/utils/env.ts` for expected env vars.

### Contributing
Please open issues or pull requests for improvements. Run linters and type checks before committing:
```bash
npm run lint
npm run typecheck
npm test
```
