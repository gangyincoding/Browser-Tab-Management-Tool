export type ImportSource = "onetab" | "bookmark_html" | "chrome_edge_file";

export interface ParsedTabItem {
  title: string;
  url: string;
}

export interface ParserOutput {
  items: ParsedTabItem[];
  total: number;
  invalid: number;
}

export interface CategoryRule {
  name: string;
  domainPatterns: string[];
}

export interface TabRecord {
  id: string;
  title: string;
  url: string;
  normalizedUrl: string;
  domain: string;
  source: ImportSource;
  category: string;
  tags: string[];
  note: string;
  hash: string;
  isDuplicate: boolean;
  duplicateOf: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTabPayload {
  category: string;
  tags: string[];
  note: string;
}

export interface ImportMeta {
  source: ImportSource;
  total: number;
  parsed: number;
  invalid: number;
}

export interface ImportResult {
  items: TabRecord[];
  meta: ImportMeta;
}

export type DuplicateFilter = "all" | "unique" | "duplicate";
