import type { ImportSource } from "../types/tab";

const SOURCE_LABELS: Record<ImportSource, string> = {
  onetab: "OneTab 文本",
  bookmark_html: "书签 HTML",
  chrome_edge_file: "Chrome/Edge 文件"
};

export function getSourceLabel(source: ImportSource): string {
  return SOURCE_LABELS[source];
}
