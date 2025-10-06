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

**Run tests:**

```bash
bun test
```

Tests follow Bun's `describe`/`it("should …")` convention and rely on Node-compatible modules via `node:`-prefixed
imports when dealing with the filesystem.

**Code quality:**

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check and fix
bun run check
```

## Architecture

### Modular Structure

```
src/
├── config.ts              # Constants (file paths)
├── types/quote.ts         # TypeScript interfaces
├── services/
│   ├── generator.ts           # AI quote generation (Gemini 2.5 Flash)
│   ├── json-storage.ts        # JSON read/write/replace operations
│   └── markdown-storage.ts    # Markdown file creation/deletion (supports optional baseDir override)
tests/
└── services/              # Service-layer tests
    ├── json-storage.test.ts   # JSON storage tests (14 test cases)
    └── markdown-storage.test.ts # Markdown storage tests (Bun runtime describe/it pattern)
```

**Note**: Utility functions (date formatting, slugification) are now handled by external packages (`date-fns`,
`slugify`).

### Data Flow

1. **Generate**: `services/generator.ts` uses Vercel AI SDK with `generateObject()` to create structured quotes (title +
   text) via Gemini 2.5 Flash
2. **Check for duplicates**: `services/json-storage.ts` checks if a quote already exists for today's date
3. **Store/Replace JSON**: Either appends new quote or replaces existing quote in `quotes.json` array
4. **Store Markdown**: `services/markdown-storage.ts` creates `quotes/yyyy/mm/dd-title-slug.md` with formatted content
   (deletes old file first if replacing)
5. **Automate**: GitHub Action (`.github/workflows/update-quote.yml`) runs on schedule, executes the script, and commits
   changes

**Duplicate Handling**: The script automatically replaces quotes for the current date instead of creating duplicates. This
ensures daily GitHub activity (commits) while maintaining data integrity. Running the script multiple times on the same
day will replace the existing quote rather than skip or append.

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

**JSON Storage Functions**:

- `loadQuotes()` - Load all quotes from JSON
- `saveQuotesToJson()` - Save quotes array to JSON
- `hasTodaysQuote(date)` - Check if quote exists for date
- `getQuoteByDate(date)` - Retrieve quote for specific date
- `replaceQuoteByDate(quote)` - Replace existing quote with same date

**Markdown Files** (`quotes/2025/10/06-embrace-the-journey.md`):

```markdown
---
title: "Embrace the Journey"
date: "2025-10-06"
---

> Quote text here...
```

**Markdown Storage Functions**:

- `saveQuoteToMarkdown(quote, date, options?)` - Create markdown file
- `deleteQuoteMarkdown(quote, options?)` - Delete markdown file (used when replacing)

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

**Git Hooks:**

- **pre-commit**: Runs `lint-staged` to check and fix staged files with Biome
- **commit-msg**: Validates commit messages against Conventional Commits specification via commitlint

Hooks are managed via Husky and configured in `.husky/` directory.

## Conventional Commits

This project enforces **Conventional Commits** specification for commit messages:

- **Format**: `type(scope): subject`
- **Common types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Automated validation**: Git hooks (husky + commitlint) validate messages before commit

**Examples:**

```bash
feat: add quote generation feature
fix: correct date formatting in markdown
docs: update README with installation steps
chore: update dependencies
```

The commit message format is automatically enforced via the `commit-msg` git hook.

## AI Assistant Integration

### Context7 MCP

This project is configured for use with Claude Code, which includes the Context7 MCP (Model Context Protocol) server for
accessing up-to-date library documentation.

**Capabilities:**

- Fetch current documentation for any library or framework used in the project
- Access version-specific API references and best practices
- Get accurate code examples and usage patterns
- Query documentation for dependencies without leaving the development workflow

**Usage:**
When working on this project, Claude Code can automatically retrieve documentation for any library by name. This ensures
accurate, current guidance based on the actual library versions in use, rather than relying on potentially outdated
training data.

No manual setup required—Context7 integration is automatically available when using Claude Code.
