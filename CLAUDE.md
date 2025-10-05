# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quotely is a motivational quote generator that uses AI to create inspirational quotes with titles. It stores quotes in
two formats:

- **JSON**: All quotes in `quotes.json` with metadata (title, text, date, timestamp)
- **Markdown**: Individual files organized by date in `quotes/yyyy/mm/dd-title-slug.md`

A GitHub Action runs automatically to generate and commit new quotes.

## Commands

**Generate a quote:**
```bash
bun run src/update-quote.ts
```

**Install dependencies:**
```bash
bun install
```

**Code quality:**
```bash
# Format code
bunx @biomejs/biome format --write .

# Lint code
bunx @biomejs/biome lint .

# Check and fix
bunx @biomejs/biome check --write .
```

## Architecture

### Modular Structure

```
src/
├── config.ts              # Constants (file paths)
├── types/quote.ts         # TypeScript interfaces
├── utils/
│   ├── date.ts           # Date formatting utilities
│   └── slugify.ts        # String slugification
├── services/
│   ├── generator.ts      # AI quote generation (Gemini 2.5 Flash)
│   ├── json-storage.ts   # JSON read/write operations
│   └── markdown-storage.ts # Markdown file creation
└── update-quote.ts       # Main orchestrator
```

### Data Flow

1. **Generate**: `services/generator.ts` uses Vercel AI SDK with `generateObject()` to create structured quotes (title +
   text) via Gemini 2.5 Flash
2. **Store JSON**: `services/json-storage.ts` appends quote to `quotes.json` array
3. **Store Markdown**: `services/markdown-storage.ts` creates `quotes/yyyy/mm/dd-title-slug.md` with formatted content
4. **Automate**: GitHub Action (`.github/workflows/workflow.yml`) runs on schedule, executes the script, and commits
   changes

### AI Integration

- Uses Vercel AI SDK (`ai` package) with Google AI provider (`@ai-sdk/google`)
- Model: `gemini-2.5-flash` for creative quote generation
- Schema validation with Zod ensures quotes have both `title` and `text`
- Configured via `GOOGLE_GENERATIVE_AI_API_KEY` environment variable

### Storage Patterns

**JSON Storage** (`quotes.json`):

```json
[
  {
    "title": "Embrace the Journey",
    "text": "Quote text here...",
    "date": "2025-10-05",
    "timestamp": "2025-10-05T16:00:00.000Z"
  }
]
```

**Markdown Files** (`quotes/2025/10/05-embrace-the-journey.md`):

```markdown
# Embrace the Journey

> Quote text here...

---

*Sunday, October 5, 2025*
```

## Configuration

Set `GOOGLE_GENERATIVE_AI_API_KEY` in `.env`:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

For GitHub Actions, add the key as a repository secret.

## Code Quality

This project uses **Biome** for formatting and linting:

- **Formatter**: Enabled with space indentation, double quotes
- **Linter**: Enabled with recommended rules
- **Auto-organize imports**: Configured via assist actions
- Configuration: `biome.json`

Always run Biome checks before committing code.

## Bun Runtime

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv

### Bun APIs

- Prefer `Bun.file()` over `node:fs`'s readFile/writeFile
- `Bun.write()` for file writing
- Use standard Node.js APIs (`node:fs/promises`, `node:path`) for advanced operations
