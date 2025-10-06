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
- 📊 **LangFuse observability** - Comprehensive AI tracing, metrics, and analytics
- ⚙️ GitHub Actions automation with daily commits
- 🎯 Modular, maintainable architecture

## 🚀 Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure Environment Variables

Create a `.env` file with the following:

```bash
# Required: Google AI API key
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here

# Optional: LangFuse observability (for AI tracing and analytics)
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

**Get your keys:**
- Google AI: [Google AI Studio](https://aistudio.google.com/apikey)
- LangFuse: [LangFuse Project Settings](https://cloud.langfuse.com) (optional, for observability)

### 3. Generate a Quote

```bash
bun run src/update-quote.ts
```

## 📁 How It Works

1. **Generate**: Uses Vercel AI SDK with Gemini 2.5 Flash to create structured quotes (title + text)
   - Randomly selects theme, tone, style, and length from variety system
   - Creates unique, context-rich prompts for maximum creativity
   - Prevents repetitive or generic quotes
2. **Check**: Detects if a quote already exists for today's date
3. **Store/Replace**:
    - **New quote**: Adds to `quotes.json` and creates new markdown file
    - **Existing quote**: Replaces entry in `quotes.json` and updates markdown file (deletes all files matching date pattern first)
    - Files stored at `quotes/yyyy/mm/dd-title-slug.md`
4. **Automate**: GitHub Actions runs daily to generate and commit quotes (always creates a commit for daily activity)

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
└── update-quote.ts        # Main script with LangFuse tracing
tests/
└── services/              # Service-layer tests (14 test cases)
    ├── json-storage.test.ts   # JSON storage & replacement tests
    └── markdown-storage.test.ts # Markdown storage & deletion tests
```

### 🎨 Quote Variety System

Every quote is generated with unique characteristics by randomly combining:

**20 Themes**: career, relationships, creativity, resilience, adventure, mindfulness, courage, wisdom, health, change, purpose, authenticity, leadership, gratitude, failure, time, solitude, passion, discipline, freedom

**12 Tones**: powerful, gentle, humorous, philosophical, poetic, raw, practical, provocative, warm, mysterious, rebellious, serene

**10 Styles**: metaphorical, storytelling, direct advice, question-based, paradoxical, contrarian, observational, comparative, imperative, reflective

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

## 🤖 GitHub Actions

The workflow (`.github/workflows/update-quote.yml`) runs automatically:

- **Schedule**: Daily at midnight UTC (`0 0 * * *`)
- **Manual**: Can be triggered via workflow_dispatch

**Setup:**

Add these secrets to your repository (Settings → Secrets and variables → Actions):
1. `GOOGLE_GENERATIVE_AI_API_KEY` - Required for AI generation
2. `LANGFUSE_PUBLIC_KEY` - Optional, for observability
3. `LANGFUSE_SECRET_KEY` - Optional, for observability
4. `LANGFUSE_HOST` - Optional, defaults to EU region

**Behavior:**

- First run of the day: Creates new quote and commits
- Subsequent runs: Replaces existing quote and commits (ensures daily GitHub activity)
- Each run always creates a commit, maintaining consistent contribution graph

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
