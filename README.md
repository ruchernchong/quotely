# Quotely

A motivational quote generator built with Bun + TypeScript and Vercel AI SDK. Automatically generates and stores
inspirational quotes with AI-generated titles.

## ✨ Features

- 🤖 AI-powered quote generation using Gemini 2.5 Flash
- 🎨 **Advanced variety system** - 7,200 unique combinations (20 themes × 12 tones × 10 styles × 3 lengths)
- 📝 Generates both quote text and creative titles
- 💾 Dual storage: JSON + organized Markdown files
- 📅 Automatic organization by date (`quotes/yyyy/mm/`)
- 🔄 Smart duplicate handling - replaces quotes for same day
- 📊 **LangFuse observability** - Optional AI tracing, metrics, and analytics
- 🚀 **GitHub composite action** - Reusable across workflows and repositories
- ⚙️ Automated daily commits via GitHub Actions
- 🎯 Modular, maintainable architecture

## 🚀 Quick Start

### Option 1: Use as GitHub Action (Recommended)

Add to your workflow:

```yaml
- uses: ruchernchong/quotely@v1
  with:
    google-api-key: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
```

**Required secrets** (add to repository Settings → Secrets and variables → Actions):
- `GOOGLE_GENERATIVE_AI_API_KEY` - Get from [Google AI Studio](https://aistudio.google.com/apikey)

**Optional secrets** (for AI observability):
- `LANGFUSE_PUBLIC_KEY` - Get from [LangFuse](https://cloud.langfuse.com)
- `LANGFUSE_SECRET_KEY`
- `LANGFUSE_HOST` (defaults to `https://cloud.langfuse.com`)

### Option 2: Run Locally

**1. Install dependencies:**

```bash
bun install
```

**2. Configure environment:**

Create a `.env` file:

```bash
# Required
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Optional (for AI observability)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

**3. Generate a quote:**

```bash
bun run src/generate-quote.ts
```

## 📁 How It Works

1. **Generate**: Uses Vercel AI SDK with Gemini 2.5 Flash to create structured quotes (title + text)
    - Randomly selects theme, tone, style, and length from variety system
    - Creates unique, context-rich prompts for maximum creativity
    - Prevents repetitive or generic quotes
2. **Check**: Detects if a quote already exists for today's date
3. **Store/Replace**:
    - **New quote**: Adds to `quotes.json` and creates new markdown file
    - **Existing quote**: Replaces entry in `quotes.json` and updates markdown file (deletes all files matching date
      pattern first)
    - Files stored at `quotes/yyyy/mm/dd-title-slug.md`
4. **Automate**: GitHub Actions runs daily to generate and commit quotes

## 🏗️ Project Structure

```
src/
├── config.ts              # Constants
├── config/
│   └── quote-variety.ts       # Variety system (themes, tones, styles, lengths)
├── instrumentation.ts     # LangFuse OpenTelemetry tracing setup
├── types/quote.ts         # TypeScript interfaces
├── services/              # Core services
│   ├── generator.ts           # AI quote generation with variety + telemetry
│   ├── json-storage.ts        # JSON read/write/replace operations
│   └── markdown-storage.ts    # Markdown create/delete operations
└── generate-quote.ts      # Main script with LangFuse tracing
tests/
└── services/              # Service-layer tests (14 test cases)
    ├── json-storage.test.ts   # JSON storage & replacement tests
    └── markdown-storage.test.ts # Markdown storage & deletion tests
```

### 🎨 Quote Variety System

Every quote is generated with unique characteristics by randomly combining:

**20 Themes**: career, relationships, creativity, resilience, adventure, mindfulness, courage, wisdom, health, change,
purpose, authenticity, leadership, gratitude, failure, time, solitude, passion, discipline, freedom

**12 Tones**: powerful, gentle, humorous, philosophical, poetic, raw, practical, provocative, warm, mysterious,
rebellious, serene

**10 Styles**: metaphorical, storytelling, direct advice, question-based, paradoxical, contrarian, observational,
comparative, imperative, reflective

**3 Lengths**: brief (20-40 words), standard (40-70 words), expansive (70-100 words)

**Result**: 7,200 possible combinations ensuring fresh, diverse quotes every day.

## 📊 Observability

This project uses **LangFuse** for comprehensive AI observability and analytics:

**What's Tracked:**

- 🎯 Every quote generation trace with full lifecycle
- 📈 Model usage metrics (Gemini 2.5 Flash)
- 💰 Token consumption and cost analysis
- ⏱️ Latency and performance metrics
- 🏷️ Custom metadata (theme, tone, style, length)
- 📝 Input/output tracking for each generation

**Integration Details:**

- Uses OpenTelemetry with `@langfuse/otel` and `@langfuse/tracing`
- Automatic span collection via `LangfuseSpanProcessor`
- Vercel AI SDK telemetry enabled with `experimental_telemetry`
- Proper flush handling for short-lived environments

**View your traces:** https://cloud.langfuse.com

## 🧪 Development

**Testing:**

```bash
bun test
```

Tests use Bun's `describe`/`it("should …")` structure and interact with the filesystem through Node compatibility
imports (e.g. `node:fs/promises`).

**Code Quality:**

This project uses [Biome](https://biomejs.dev) for linting and formatting:

```bash
# Format code
bun run format

# Lint code
bun run lint

# Check and fix all issues
bun run check
```

**Git Hooks:**

This project uses [Husky](https://typicode.github.io/husky/) to enforce code quality:

- **pre-commit**: Automatically runs Biome on staged files
- **commit-msg**: Validates commit messages follow [Conventional Commits](https://conventionalcommits.org/) format

## 🤖 GitHub Action Usage

### Composite Action

This project is available as a **reusable GitHub composite action**. The action encapsulates:
- Bun runtime setup
- Dependency installation
- Quote generation with AI
- Optional automatic commits

### Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `google-api-key` | ✅ Yes | - | Google Generative AI API key |
| `langfuse-public-key` | ❌ No | - | LangFuse public key (optional) |
| `langfuse-secret-key` | ❌ No | - | LangFuse secret key (optional) |
| `langfuse-host` | ❌ No | - | LangFuse host URL (optional) |
| `auto-commit` | ❌ No | `'true'` | Auto-commit and push changes |

### Example Workflows

**Daily automated quotes:**

```yaml
name: Generate Quote
on:
  schedule:
    - cron: "0 0 * * *"  # Daily at midnight UTC

jobs:
  generate-quote:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: ruchernchong/quotely@v1
        with:
          google-api-key: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
          langfuse-public-key: ${{ secrets.LANGFUSE_PUBLIC_KEY }}
          langfuse-secret-key: ${{ secrets.LANGFUSE_SECRET_KEY }}
          langfuse-host: ${{ secrets.LANGFUSE_HOST }}
```

**Manual trigger without commits:**

```yaml
name: Generate Quote (No Commit)
on: workflow_dispatch

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruchernchong/quotely@v1
        with:
          google-api-key: ${{ secrets.GOOGLE_GENERATIVE_AI_API_KEY }}
          auto-commit: 'false'
```

### Workflow Behavior

- **First run of the day**: Creates new quote and commits
- **Subsequent runs**: Replaces existing quote and commits
- **Auto-commit enabled**: Each run creates a commit with message `chore: update quote [skip ci]`

**Additional workflows:**

A separate workflow (`.github/workflows/release.yml`) runs on pushes to `main`, executing tests and `semantic-release` before creating releases.

## 📦 Releases

Semantic-release keeps project versions, changelog entries, and GitHub releases in sync with Conventional Commits.

- `.github/workflows/release.yml` runs on pushes to `main` after tests succeed and executes `bunx semantic-release`
- Releases update `CHANGELOG.md`, tag the commit, and publish GitHub releases without publishing to npm
- Run `bun run release` locally to trigger the same flow (requires `GITHUB_TOKEN` with repo scope when run outside CI)

## 🛠️ Tech Stack

**Runtime & Language:**

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- TypeScript - Type safety

**AI & Data:**

- [Vercel AI SDK](https://ai-sdk.dev) - AI integration framework
- [Gemini 2.5 Flash](https://ai.google.dev) - Google's AI model
- [Zod](https://zod.dev) - Schema validation

**Observability:**

- [LangFuse](https://langfuse.com) - AI observability and analytics
- [OpenTelemetry](https://opentelemetry.io) - Distributed tracing

**Utilities:**

- [date-fns](https://date-fns.org) - Date formatting
- [slugify](https://github.com/simov/slugify) - String slugification

**Code Quality:**

- [Biome](https://biomejs.dev) - Fast formatter and linter
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [lint-staged](https://github.com/lint-staged/lint-staged) - Pre-commit file linting
- [commitlint](https://commitlint.js.org/) - Commit message validation
