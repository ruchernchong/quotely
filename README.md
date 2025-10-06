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
- ⚙️ GitHub Actions automation with daily commits
- 🎯 Modular, maintainable architecture

## 🚀 Setup

### 1. Install Dependencies

```bash
bun install
```

### 2. Configure API Key

Get your Google AI API key from [Google AI Studio](https://aistudio.google.com/apikey).

Create a `.env` file:

```bash
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

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
├── types/quote.ts         # TypeScript interfaces
├── services/              # Core services
│   ├── generator.ts           # AI quote generation with variety
│   ├── json-storage.ts        # JSON read/write/replace operations
│   └── markdown-storage.ts    # Markdown create/delete operations
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

1. Add `GOOGLE_GENERATIVE_AI_API_KEY` to repository secrets
2. The action will generate and commit new quotes automatically

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

**Utilities:**

- [date-fns](https://date-fns.org) - Date formatting
- [slugify](https://github.com/simov/slugify) - String slugification

**Code Quality:**

- [Biome](https://biomejs.dev) - Fast formatter and linter
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [lint-staged](https://github.com/lint-staged/lint-staged) - Pre-commit file linting
- [commitlint](https://commitlint.js.org/) - Commit message validation
