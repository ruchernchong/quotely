import { addDays, format, isValid } from "date-fns";
import { generateQuote } from "@/services/generator";
import { JsonStorage } from "@/services/json-storage";
import { MarkdownStorage } from "@/services/markdown-storage";
import type { Quote } from "@/types/quote";

type CliOptions = {
  startDate: string;
  endDate: string;
  replace: boolean;
  dryRun: boolean;
};

const parseArgs = (argv: string[]): CliOptions => {
  let startDate: string | undefined;
  let endDate: string | undefined;
  let replace = false;
  let dryRun = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === "--start") {
      startDate = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--end") {
      endDate = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === "--replace") {
      replace = true;
      continue;
    }

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!startDate || !endDate) {
    throw new Error("Both --start and --end are required.");
  }

  return {
    startDate,
    endDate,
    replace,
    dryRun,
  };
};

const printHelp = (): void => {
  console.log("Backfill quotes for a date range.");
  console.log("");
  console.log(
    "Usage: bun run src/backfill-quotes.ts --start YYYY-MM-DD --end YYYY-MM-DD [--replace] [--dry-run]",
  );
  console.log("");
  console.log("Options:");
  console.log("  --start     Start date (inclusive), format YYYY-MM-DD");
  console.log("  --end       End date (inclusive), format YYYY-MM-DD");
  console.log("  --replace   Replace existing quotes in the range");
  console.log(
    "  --dry-run   Show what would be generated without writing files",
  );
};

const parseDate = (value: string): Date => {
  const [yearString, monthString, dayString] = value.split("-");
  const year = Number(yearString);
  const month = Number(monthString);
  const day = Number(dayString);

  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  if (!isValid(date)) {
    throw new Error(`Invalid date: ${value}`);
  }

  if (format(date, "yyyy-MM-dd") !== value) {
    throw new Error(`Invalid date format/value: ${value}`);
  }

  return date;
};

const generateForDate = async (
  dateString: string,
  replace: boolean,
  dryRun: boolean,
): Promise<{
  status: "created" | "replaced" | "skipped";
}> => {
  const jsonStorage = new JsonStorage();
  const markdownStorage = new MarkdownStorage();
  const existingQuote = await jsonStorage.getQuoteByDate(dateString);

  if (existingQuote && !replace) {
    return { status: "skipped" };
  }

  if (dryRun) {
    return { status: existingQuote ? "replaced" : "created" };
  }

  const { title, text } = await generateQuote();
  const timestamp = parseDate(dateString);

  const quote: Quote = {
    title,
    text,
    date: dateString,
    timestamp: timestamp.toISOString(),
  };

  if (existingQuote) {
    await markdownStorage.deleteQuote(existingQuote);
    await jsonStorage.replaceQuoteByDate(quote);
  } else {
    const quotes = await jsonStorage.loadQuotes();
    quotes.push(quote);
    await jsonStorage.saveQuotes(quotes);
  }

  await markdownStorage.saveQuote(quote, dateString);

  return { status: existingQuote ? "replaced" : "created" };
};

const main = async (): Promise<void> => {
  try {
    const options = parseArgs(process.argv.slice(2));
    const start = parseDate(options.startDate);
    const end = parseDate(options.endDate);

    if (start.getTime() > end.getTime()) {
      throw new Error("--start must be earlier than or equal to --end");
    }

    let cursor = start;
    let created = 0;
    let replaced = 0;
    let skipped = 0;

    while (cursor.getTime() <= end.getTime()) {
      const dateString = format(cursor, "yyyy-MM-dd");
      const { status } = await generateForDate(
        dateString,
        options.replace,
        options.dryRun,
      );

      if (status === "created") {
        created += 1;
        console.log(`[created] ${dateString}`);
      } else if (status === "replaced") {
        replaced += 1;
        console.log(`[replaced] ${dateString}`);
      } else {
        skipped += 1;
        console.log(`[skipped] ${dateString} (already exists)`);
      }

      cursor = addDays(cursor, 1);
    }

    console.log("");
    console.log("Backfill complete.");
    console.log(`Created: ${created}`);
    console.log(`Replaced: ${replaced}`);
    console.log(`Skipped: ${skipped}`);
  } catch (error) {
    console.error("❌ Backfill failed:", error);
    process.exitCode = 1;
  }
};

main();
