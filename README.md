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
├── utils/                 # Utility functions (date, slugify)
├── services/              # Core services
│   ├── generator.ts       # AI quote generation
│   ├── json-storage.ts    # JSON operations
│   └── markdown-storage.ts # Markdown file creation
└── update-quote.ts        # Main orchestrator
```

## 🧪 Development

**Code Quality Tools:**

This project uses [Biome](https://biomejs.dev) for linting and formatting:

```bash
# Format code
bunx @biomejs/biome format --write .

# Lint code
bunx @biomejs/biome lint .

# Check and fix all issues
bunx @biomejs/biome check --write .
```

## 🤖 GitHub Actions

The workflow runs automatically on schedule. To set up:

1. Add `GOOGLE_GENERATIVE_AI_API_KEY` to repository secrets
2. The action will generate and commit new quotes automatically

## 🛠️ Tech Stack

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- [Vercel AI SDK](https://sdk.vercel.ai) - AI integration framework
- [Gemini 2.5 Flash](https://ai.google.dev) - Google's AI model
- [Zod](https://zod.dev) - Schema validation
- [Biome](https://biomejs.dev) - Fast formatter and linter
- TypeScript - Type safety
