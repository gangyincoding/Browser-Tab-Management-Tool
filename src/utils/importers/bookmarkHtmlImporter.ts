import type { ParserOutput, ParsedTabItem } from "../../types/tab";
import { readFileAsText } from "./shared";

export function parseBookmarkHtmlText(htmlText: string): ParserOutput {
  const documentFragment = new DOMParser().parseFromString(htmlText, "text/html");
  const anchors = [...documentFragment.querySelectorAll("a[href]")];
  const items: ParsedTabItem[] = [];
  let invalid = 0;

  for (const anchor of anchors) {
    const href = anchor.getAttribute("href")?.trim() ?? "";
    if (!href) {
      invalid += 1;
      continue;
    }

    items.push({
      title: anchor.textContent?.trim() ?? "",
      url: href
    });
  }

  return {
    items,
    total: anchors.length,
    invalid
  };
}

export async function parseBookmarkHtmlFile(file: File): Promise<ParserOutput> {
  const htmlText = await readFileAsText(file);
  return parseBookmarkHtmlText(htmlText);
}
