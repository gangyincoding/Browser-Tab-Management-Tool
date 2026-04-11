import type { ParserOutput, ParsedTabItem } from "../../types/tab";
import { parseBookmarkHtmlText } from "./bookmarkHtmlImporter";
import { parseOneTabText } from "./oneTabImporter";
import { readFileAsText } from "./shared";

function collectUrlItemsFromUnknownObject(input: unknown, collector: ParsedTabItem[]): void {
  if (!input) {
    return;
  }

  if (Array.isArray(input)) {
    for (const entry of input) {
      collectUrlItemsFromUnknownObject(entry, collector);
    }
    return;
  }

  if (typeof input !== "object") {
    return;
  }

  const objectEntry = input as Record<string, unknown>;
  const urlValue = typeof objectEntry.url === "string" ? objectEntry.url : null;
  const titleValue =
    typeof objectEntry.title === "string"
      ? objectEntry.title
      : typeof objectEntry.name === "string"
        ? objectEntry.name
        : "";

  if (urlValue) {
    collector.push({
      title: titleValue,
      url: urlValue
    });
  }

  for (const value of Object.values(objectEntry)) {
    collectUrlItemsFromUnknownObject(value, collector);
  }
}

function parseJsonContent(text: string): ParserOutput | null {
  try {
    const parsed = JSON.parse(text) as unknown;
    const items: ParsedTabItem[] = [];
    collectUrlItemsFromUnknownObject(parsed, items);
    return {
      items,
      total: items.length,
      invalid: 0
    };
  } catch {
    return null;
  }
}

export function parseChromeEdgeText(text: string): ParserOutput {
  const trimmed = text.trim();
  if (!trimmed) {
    return { items: [], total: 0, invalid: 0 };
  }

  const parsedJson = parseJsonContent(trimmed);
  if (parsedJson) {
    return parsedJson;
  }

  if (/<a\s+[^>]*href=/i.test(trimmed)) {
    return parseBookmarkHtmlText(trimmed);
  }

  return parseOneTabText(trimmed);
}

export async function parseChromeEdgeFile(file: File): Promise<ParserOutput> {
  const content = await readFileAsText(file);
  return parseChromeEdgeText(content);
}
