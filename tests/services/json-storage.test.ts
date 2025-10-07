import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonStorage } from "../../src/services/json-storage.ts";
import type { Quote } from "../../src/types/quote.ts";

describe("json-storage", () => {
  let tempDir: string;
  let testJsonPath: string;
  let storage: JsonStorage;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "quotely-test-"));
    testJsonPath = join(tempDir, "quotes.json");
    storage = new JsonStorage(testJsonPath);
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

    const loaded = await storage.loadQuotes();

    expect(loaded).toEqual(quotes);
  });

  it("should return empty array when file doesn't exist", async () => {
    const loaded = await storage.loadQuotes();

    expect(loaded).toEqual([]);
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

    await storage.saveQuotes(quotes);

    const file = Bun.file(testJsonPath);
    const content = await file.text();

    expect(content).toContain("Test Quote");
    expect(content).toContain("This is a test");
  });

  it("should return true when quote exists for date", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "This is a test",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const exists = await storage.hasTodayQuote("2025-10-05");

    expect(exists).toBe(true);
  });

  it("should return false when no quote exists for date", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "This is a test",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const exists = await storage.hasTodayQuote("2025-10-06");

    expect(exists).toBe(false);
  });

  it("should return false when quotes file is empty", async () => {
    const quotes: Quote[] = [];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const exists = await storage.hasTodayQuote("2025-10-05");

    expect(exists).toBe(false);
  });

  it("should get quote by date", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote 1",
        text: "This is test 1",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
      {
        title: "Test Quote 2",
        text: "This is test 2",
        date: "2025-10-06",
        timestamp: "2025-10-06T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const quote = await storage.getQuoteByDate("2025-10-06");

    expect(quote).toBeDefined();
    expect(quote?.title).toBe("Test Quote 2");
    expect(quote?.date).toBe("2025-10-06");
  });

  it("should return undefined when getting quote for non-existent date", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "This is a test",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const quote = await storage.getQuoteByDate("2025-10-06");

    expect(quote).toBeUndefined();
  });

  it("should replace quote by date", async () => {
    const quotes: Quote[] = [
      {
        title: "Old Quote",
        text: "Old text",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const newQuote: Quote = {
      title: "New Quote",
      text: "New text",
      date: "2025-10-05",
      timestamp: "2025-10-05T13:00:00.000Z",
    };

    const oldQuote = await storage.replaceQuoteByDate(newQuote);

    expect(oldQuote).toBeDefined();
    expect(oldQuote?.title).toBe("Old Quote");

    const updatedQuotes = await storage.loadQuotes();
    expect(updatedQuotes).toHaveLength(1);
    expect(updatedQuotes[0].title).toBe("New Quote");
    expect(updatedQuotes[0].text).toBe("New text");
  });

  it("should return undefined when replacing quote for non-existent date", async () => {
    const quotes: Quote[] = [
      {
        title: "Test Quote",
        text: "Test text",
        date: "2025-10-05",
        timestamp: "2025-10-05T12:00:00.000Z",
      },
    ];

    await Bun.write(testJsonPath, JSON.stringify(quotes));

    const newQuote: Quote = {
      title: "New Quote",
      text: "New text",
      date: "2025-10-06",
      timestamp: "2025-10-06T12:00:00.000Z",
    };

    const oldQuote = await storage.replaceQuoteByDate(newQuote);

    expect(oldQuote).toBeUndefined();

    const updatedQuotes = await storage.loadQuotes();
    expect(updatedQuotes).toHaveLength(1);
    expect(updatedQuotes[0].title).toBe("Test Quote");
  });
});
