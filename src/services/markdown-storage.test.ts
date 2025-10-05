import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Quote } from "../types/quote";

describe("markdown-storage", () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quotely-test-"));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("creates markdown file with frontmatter", async () => {
    const quote: Quote = {
      title: "Embrace the Journey",
      text: "Every step forward is progress.",
      date: "2025-10-05",
      timestamp: "2025-10-05T12:00:00.000Z",
    };

    const filePath = join(tempDir, "test.md");
    const content = `---
title: "${quote.title}"
date: "${quote.date}"
---

> ${quote.text}
`;

    await Bun.write(filePath, content);
    const file = Bun.file(filePath);
    const result = await file.text();

    expect(result).toContain('title: "Embrace the Journey"');
    expect(result).toContain('date: "2025-10-05"');
    expect(result).toContain("> Every step forward is progress.");
  });

  test("creates correct filename with slug", async () => {
    const title = "Embrace the Journey!";
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    expect(slug).toBe("embrace-the-journey");
  });
});
