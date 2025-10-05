import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Quote } from "../types/quote";

describe("json-storage", () => {
  let tempDir: string;
  let testJsonPath: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quotely-test-"));
    testJsonPath = join(tempDir, "quotes.json");
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it("should load quotes from existing file", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "This is a test",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const file = Bun.file(testJsonPath);
    const loaded = JSON.parse(await file.text());

    expect(loaded).toEqual(quotes);
  });

  it("should return empty array when file doesn't exist", async () => {
    const file = Bun.file(testJsonPath);
    const exists = await file.exists();

    expect(exists).toBe(false);
  });

  it("should save quotes to JSON file", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "This is a test",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes, null, 2));

    const file = Bun.file(testJsonPath);
    const content = await file.text();

    expect(content).toContain("Test Quote");
    expect(content).toContain("This is a test");
  });
});
