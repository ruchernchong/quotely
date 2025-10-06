# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quotely is a motivational quote generator that uses AI to create inspirational quotes with titles. It stores quotes in
two formats:

- **JSON**: All quotes in `quotes.json` with metadata (title, text, date, timestamp)
- **Markdown**: Individual files organized by date in `quotes/yyyy/mm/dd-title-slug.md`

A GitHub Action runs automatically to generate and commit new quotes.

**Observability**: The project uses LangFuse for AI observability and analytics, tracking all quote generations with detailed telemetry including model usage, token consumption, latency metrics, and custom metadata (theme, tone, style, length).

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
├── config/
│   └── quote-variety.ts       # Quote variety configuration (themes, tones, styles, lengths)
├── instrumentation.ts     # LangFuse OpenTelemetry tracing setup
├── types/quote.ts         # TypeScript interfaces
├── services/
│   ├── generator.ts           # AI quote generation with variety system (Gemini 2.5 Flash) + LangFuse telemetry
│   ├── json-storage.ts        # JSON read/write/replace operations
│   └── markdown-storage.ts    # Markdown file creation/deletion (supports optional baseDir override)
└── update-quote.ts        # Main script with LangFuse tracing wrapper
tests/
└── services/              # Service-layer tests
    ├── json-storage.test.ts   # JSON storage tests (14 test cases)
    └── markdown-storage.test.ts # Markdown storage tests (Bun runtime describe/it pattern)
```

**Note**: Utility functions (date formatting, slugification) are now handled by external packages (`date-fns`,
`slugify`).

### Data Flow

1. **Generate**: `services/generator.ts` uses Vercel AI SDK with `generateObject()` to create structured quotes (title +
   text) via Gemini 2.5 Flash with dynamic variety system
   - Randomly selects from 20 themes (career, creativity, courage, purpose, etc.)
   - Randomly selects from 12 tones (poetic, raw, humorous, philosophical, etc.)
   - Randomly selects from 10 styles (metaphorical, question-based, paradoxical, etc.)
   - Randomly selects from 3 length ranges (brief, standard, expansive)
   - Creates unique, context-rich prompts for each generation (7,200 possible combinations)
2. **Check for duplicates**: `services/json-storage.ts` checks if a quote already exists for today's date
3. **Store/Replace JSON**: Either appends new quote or replaces existing quote in `quotes.json` array
4. **Store Markdown**: `services/markdown-storage.ts` creates `quotes/yyyy/mm/dd-title-slug.md` with formatted content
   (when replacing, deletes all markdown files matching the date pattern first, e.g., all `06-*.md` files)
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

**LangFuse Observability** (`instrumentation.ts`):

The project integrates LangFuse for comprehensive AI observability using OpenTelemetry:

- **Tracing Setup**: Uses `@langfuse/otel` with `LangfuseSpanProcessor` and `NodeTracerProvider`
- **Observation Wrapping**: Main function wrapped with `observe()` from `@langfuse/tracing` for automatic trace creation
- **Active Updates**: Uses `updateActiveTrace()` and `updateActiveObservation()` to enrich traces with metadata
- **AI SDK Telemetry**: Vercel AI SDK's `experimental_telemetry` enabled with `isEnabled: true` and custom metadata
- **Flush Handling**: Ensures proper span flushing via `forceFlush()` before shutdown (critical for short-lived environments)
- **Environment Variables**: `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`

**Tracked Metrics**:
- Trace name: `generate-daily-quote`
- Tags: `quote-generation`, `daily-automation`
- Input metadata: theme, tone, style, length (from variety system)
- Output: generated title, text, date, file path
- Custom attributes: whether quote is a replacement, markdown file paths
- AI SDK metrics: model usage, token consumption, latency

**Quote Variety System** (`config/quote-variety.ts`):

The variety system ensures each generated quote is unique and diverse by randomly combining:

- **20 Themes**: career and ambition, relationships and connection, creativity and innovation, resilience and
  perseverance, adventure and exploration, mindfulness and presence, courage and fear, wisdom and learning, health and
  vitality, change and transformation, purpose and meaning, authenticity and self-expression, leadership and influence,
  gratitude and appreciation, failure and growth, time and mortality, solitude and reflection, passion and enthusiasm,
  discipline and consistency, freedom and independence

- **12 Tones**: powerful and commanding, gentle and nurturing, humorous and playful, philosophical and contemplative,
  poetic and lyrical, raw and honest, practical and straightforward, provocative and challenging, warm and encouraging,
  mysterious and enigmatic, rebellious and unconventional, serene and peaceful

- **10 Styles**: metaphorical (using nature, journey, or object metaphors), storytelling (brief narrative or parable),
  direct advice (clear actionable wisdom), question-based (posing thought-provoking questions), paradoxical (embracing
  contradictions), contrarian (challenging common beliefs), observational (keen insights about human nature), comparative
  (contrasting two concepts), imperative (strong calls to action), reflective (looking inward)

- **3 Lengths**: brief (20-40 words), standard (40-70 words), expansive (70-100 words)

This creates **7,200 possible combinations**, preventing repetitive quotes and ensuring fresh, creative content daily.

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

- `saveQuoteToMarkdown(quote, date, options?)` - Create markdown file with title-slug in filename
- `deleteQuoteMarkdown(quote, options?)` - Delete all markdown files matching the date (e.g., `06-*.md`) to support replacement even when titles change

## Configuration

Required environment variables in `.env`:

```bash
# Google AI API key for Gemini model
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# LangFuse observability credentials
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # EU region (default)
# LANGFUSE_HOST=https://us.cloud.langfuse.com  # US region alternative

# Optional: Enable LangFuse debug logging
LANGFUSE_DEBUG=true
```

**For GitHub Actions**, add these secrets to repository settings:
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `LANGFUSE_PUBLIC_KEY`
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_HOST`

Get LangFuse keys from: https://cloud.langfuse.com (project settings)

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
