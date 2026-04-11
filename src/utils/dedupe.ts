import type { TabRecord } from "../types/tab";

function normalizeTextValue(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getDedupKey(tab: Pick<TabRecord, "normalizedUrl" | "title" | "domain">): string {
  if (tab.normalizedUrl) {
    return `url:${tab.normalizedUrl}`;
  }
  return `title_domain:${normalizeTextValue(tab.title)}|${normalizeTextValue(tab.domain)}`;
}

export function annotateDuplicates(tabs: TabRecord[]): TabRecord[] {
  const seenByKey = new Map<string, string>();

  return tabs.map((tab) => {
    const key = getDedupKey(tab);
    const existingId = seenByKey.get(key);

    if (!existingId) {
      seenByKey.set(key, tab.id);
      return {
        ...tab,
        isDuplicate: false,
        duplicateOf: null
      };
    }

    return {
      ...tab,
      isDuplicate: true,
      duplicateOf: existingId
    };
  });
}
