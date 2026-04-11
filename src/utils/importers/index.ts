import type { ImportSource, ParserOutput } from "../../types/tab";
import { parseBookmarkHtmlFile } from "./bookmarkHtmlImporter";
import { parseChromeEdgeFile } from "./chromeEdgeImporter";
import { parseOneTabText } from "./oneTabImporter";

export async function parseBySource(
  source: ImportSource,
  payload: {
    text?: string;
    file?: File;
  }
): Promise<ParserOutput> {
  switch (source) {
    case "onetab": {
      return parseOneTabText(payload.text ?? "");
    }
    case "bookmark_html": {
      if (!payload.file) {
        return { items: [], total: 0, invalid: 0 };
      }
      return parseBookmarkHtmlFile(payload.file);
    }
    case "chrome_edge_file": {
      if (!payload.file) {
        return { items: [], total: 0, invalid: 0 };
      }
      return parseChromeEdgeFile(payload.file);
    }
    default: {
      return { items: [], total: 0, invalid: 0 };
    }
  }
}
