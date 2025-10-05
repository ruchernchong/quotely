# Quotely

A motivational quote generator built with Bun + TypeScript and Vercel AI SDK. Automatically generates and stores
inspirational quotes with AI-generated titles.

## ✨ Features

- 🤖 AI-powered quote generation using Gemini 2.5 Flash
- 📝 Generates both quote text and creative titles
- 💾 Dual storage: JSON + organized Markdown files
- 📅 Automatic organization by date (`quotes/yyyy/mm/`)
- ⚙️ GitHub Actions automation
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
2. **Store**: Saves to both:
    - `quotes.json` - All quotes with metadata
    - `quotes/yyyy/mm/dd-title-slug.md` - Individual markdown files organized by date
3. **Automate**: GitHub Actions runs on schedule to generate and commit new quotes

## 🏗️ Project Structure

```
src/
├── config.ts              # Constants
├── types/quote.ts         # TypeScript interfaces
├── services/              # Core services
│   ├── generator.ts           # AI quote generation
│   ├── json-storage.ts        # JSON operations
│   ├── json-storage.test.ts   # JSON storage tests
│   ├── markdown-storage.ts    # Markdown file creation (optional baseDir override)
│   └── markdown-storage.test.ts # Markdown storage tests (Bun describe/it)
└── update-quote.ts        # Main orchestrator
```

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
