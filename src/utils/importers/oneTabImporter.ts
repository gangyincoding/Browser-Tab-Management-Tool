import type { ParserOutput, ParsedTabItem } from "../../types/tab";
import { readFileAsText, splitNonEmptyLines } from "./shared";

const URL_PATTERN = /(https?:\/\/[^\s|]+)/i;

function parseOneTabLine(line: string): ParsedTabItem | null {
  const urlMatch = line.match(URL_PATTERN);
  if (!urlMatch) {
    return null;
  }

  const url = urlMatch[1];
  let title = "";

  if (line.includes("|")) {
    const segments = line
      .split("|")
      .map((segment) => segment.trim())
      .filter(Boolean);

    const urlSegmentIndex = segments.findIndex((segment) => URL_PATTERN.test(segment));
    if (urlSegmentIndex >= 0) {
      title = segments.find((_, index) => index !== urlSegmentIndex) ?? "";
    }
  } else {
    title = line.replace(url, "").replace(/^[\s\-:]+/, "").trim();
  }

  return { title, url };
}

export function parseOneTabText(text: string): ParserOutput {
  const lines = splitNonEmptyLines(text);
  const items: ParsedTabItem[] = [];
  let invalid = 0;

  for (const line of lines) {
    const parsed = parseOneTabLine(line);
    if (!parsed) {
      invalid += 1;
      continue;
    }
    items.push(parsed);
  }

  return {
    items,
    total: lines.length,
    invalid
  };
}

export async function parseOneTabFile(file: File): Promise<ParserOutput> {
  const text = await readFileAsText(file);
  return parseOneTabText(text);
}
