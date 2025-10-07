# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quotely is a motivational quote generator that uses AI to create inspirational quotes with titles. It stores quotes in
two formats:

- **JSON**: All quotes in `quotes.json` with metadata (title, text, date, timestamp)
- **Markdown**: Individual files organized by date in `quotes/yyyy/mm/dd-title-slug.md`

The project is packaged as a **GitHub composite action** (`action.yml`) that can be used in any workflow or repository.

**Observability**: The project uses LangFuse for AI observability and analytics (optional), tracking all quote generations
with detailed telemetry including model usage, token consumption, latency metrics, and custom metadata (theme, tone, style,
length).

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
action.yml                 # GitHub composite action definition
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
.github/workflows/
├── update-quote.yml       # Daily quote generation workflow (uses composite action)
└── release.yml           # Semantic release workflow
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
5. **Automate**: GitHub composite action encapsulates the entire workflow; `.github/workflows/update-quote.yml` uses the
   action to run on schedule and commit changes

**Duplicate Handling**: The script automatically replaces quotes for the current date instead of creating duplicates. This
maintains data integrity while ensuring consistent behavior. Running the script multiple times on the same day will replace
the existing quote rather than skip or append.

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
- **Flush Handling**: Ensures proper span flushing via `forceFlush()` before shutdown (critical for short-lived
  environments)
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
  contradictions), contrarian (challenging common beliefs), observational (keen insights about human nature),
  comparative
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
- `deleteQuoteMarkdown(quote, options?)` - Delete all markdown files matching the date (e.g., `06-*.md`) to support
  replacement even when titles change

## Configuration

### Local Development

Required environment variables in `.env`:

```bash
# Required: Google AI API key for Gemini model
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Optional: LangFuse observability credentials
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com  # EU region (default)
# LANGFUSE_HOST=https://us.cloud.langfuse.com  # US region alternative

# Optional: Enable LangFuse debug logging
LANGFUSE_DEBUG=true
```

### GitHub Composite Action

The `action.yml` composite action accepts the following inputs:

**Required:**
- `google-api-key` - Google Generative AI API key for Gemini model

**Optional:**
- `langfuse-public-key` - LangFuse public key for observability
- `langfuse-secret-key` - LangFuse secret key for observability
- `langfuse-host` - LangFuse host URL (e.g., https://cloud.langfuse.com)
- `auto-commit` - Automatically commit and push changes (default: `'true'`)

**Usage in workflows:**

```yaml
- uses: ruchernchong/quotely@v1
  with:
    google-api-key: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
    # Optional LangFuse credentials
    langfuse-public-key: ${{ secrets.LANGFUSE_PUBLIC_KEY }}
    langfuse-secret-key: ${{ secrets.LANGFUSE_SECRET_KEY }}
    langfuse-host: ${{ secrets.LANGFUSE_HOST }}
    # Optional: disable auto-commit
    auto-commit: 'false'
```

**For GitHub Actions secrets**, add these to repository settings (Settings → Secrets and variables → Actions):

- `GOOGLE_GENERATIVE_AI_API_KEY` (required)
- `LANGFUSE_PUBLIC_KEY` (optional)
- `LANGFUSE_SECRET_KEY` (optional)
- `LANGFUSE_HOST` (optional)

Get API keys from:
- Google AI: https://aistudio.google.com/apikey
- LangFuse: https://cloud.langfuse.com (project settings)

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

## Semantic Release

This project uses **semantic-release** to automate versioning and releases based on Conventional Commits:

**How it works:**

- Analyzes commit messages to determine version bumps:
    - `feat:` commits → minor version (e.g., 1.0.0 → 1.1.0)
    - `fix:` commits → patch version (e.g., 1.0.0 → 1.0.1)
    - `BREAKING CHANGE:` in commit body → major version (e.g., 1.0.0 → 2.0.0)
- Automatically generates `CHANGELOG.md` from commit messages
- Creates Git tags (e.g., `v1.2.0`)
- Creates GitHub releases with release notes
- Updates `package.json` version

**Automation:**

- Releases are triggered automatically on push to `main` branch via GitHub Actions (`.github/workflows/release.yml`)
- Tests must pass before release workflow runs
- Workflow runs `bunx semantic-release` with `GITHUB_TOKEN` authentication

**Manual release:**

```bash
bun run release
```

**Configuration:**

- `.releaserc.json` - Semantic release configuration
- Plugins: commit-analyzer, release-notes-generator, changelog, npm (no publish), github, git
- Package is marked as `private` to prevent npm publishing

**Note**: The workflow includes `[skip ci]` in release commits to prevent infinite loops.

## Documentation Maintenance

This section defines when changes require updates to project documentation.

### When to Update CLAUDE.md

Update this file when making changes that affect how AI assistants or developers work with the codebase:

**Architecture & Structure:**

- New services, modules, or major architectural changes
- Changes to data flow or processing pipelines
- New functions/APIs in existing services (update function lists)
- Changes to file organization or project structure

**Configuration & Environment:**

- New environment variables or configuration options
- Changes to existing configuration requirements
- Updates to .env setup or secrets management

**Dependencies & Integrations:**

- New external services (AI providers, observability tools, APIs)
- Major dependency additions or replacements
- Changes to AI model configuration or providers
- Updates to telemetry or monitoring systems

**Development Workflow:**

- New commands or scripts
- Changes to testing patterns or test structure
- Updates to git hooks or automation
- New code quality tools or linting rules

**Data & Storage:**

- Changes to JSON or Markdown storage patterns
- New storage functions or data transformations
- Updates to duplicate handling or replacement logic

### When to Update README.md

Update this file when making changes that affect user experience or project setup:

**Features & Functionality:**

- New user-facing features
- Major functionality additions or changes
- Updates to quote generation behavior (themes, tones, styles)

**Setup & Installation:**

- Changes to installation steps
- New environment variables users need to configure
- Updates to API key requirements or setup
- Changes to GitHub Actions secrets

**Usage & Commands:**

- New CLI commands or scripts
- Changes to how users run or interact with the project
- Updates to testing or development commands

**Tech Stack:**

- New major dependencies or frameworks
- Changes to runtime (Bun, Node, etc.)
- Updates to AI models or providers

**Automation:**

- Changes to GitHub Actions behavior or schedule
- Updates to workflow triggers or automation logic

### Quick Reference Checklist

Before committing changes, ask:

- [ ] Did I add/modify services or core functionality? → Update **CLAUDE.md** Architecture section
- [ ] Did I add new environment variables? → Update **both** Configuration sections
- [ ] Did I add external integrations or dependencies? → Update **both** (technical details in CLAUDE.md, user impact in
  README.md)
- [ ] Did I change user-facing features? → Update **README.md** Features section
- [ ] Did I modify commands or workflows? → Update **both** Commands sections
- [ ] Did I change data storage patterns? → Update **CLAUDE.md** Storage Patterns section

**Rule of thumb**: If it changes behavior, configuration, or structure, update documentation. When in doubt, update it.

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
