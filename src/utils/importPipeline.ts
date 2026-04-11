import { UNCATEGORIZED } from "../constants/categoryRules";
import type { CategoryRule, ImportResult, ImportSource, ParserOutput, TabRecord } from "../types/tab";
import { categorizeDomain } from "./categorize";
import { annotateDuplicates } from "./dedupe";
import { createStableHash, createTabId } from "./hash";
import { extractDomain, fallbackTitleFromDomain, normalizeTitle, normalizeUrl } from "./url";

interface RunImportPipelineParams {
  source: ImportSource;
  parserOutput: ParserOutput;
  existingTabs: TabRecord[];
  categoryRules: CategoryRule[];
}

interface RunImportPipelineOutput {
  tabs: TabRecord[];
  result: ImportResult;
}

function createDraftTab(source: ImportSource, title: string, url: string, timestamp: string): TabRecord | null {
  const normalizedUrl = normalizeUrl(url);
  if (!normalizedUrl) {
    return null;
  }

  const domain = extractDomain(normalizedUrl);
  const normalizedTitle = normalizeTitle(title) || fallbackTitleFromDomain(domain);

  return {
    id: createTabId(),
    title: normalizedTitle,
    url: normalizedUrl,
    normalizedUrl,
    domain,
    source,
    category: UNCATEGORIZED,
    tags: [],
    note: "",
    hash: createStableHash(`${normalizedUrl}|${normalizedTitle.toLowerCase()}`),
    isDuplicate: false,
    duplicateOf: null,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function runImportPipeline({
  source,
  parserOutput,
  existingTabs,
  categoryRules
}: RunImportPipelineParams): RunImportPipelineOutput {
  const now = new Date().toISOString();
  const freshTabs: TabRecord[] = [];
  let additionalInvalid = 0;

  for (const item of parserOutput.items) {
    const drafted = createDraftTab(source, item.title, item.url, now);
    if (!drafted) {
      additionalInvalid += 1;
      continue;
    }
    freshTabs.push(drafted);
  }

  const mergedTabs = [...existingTabs, ...freshTabs];
  const dedupedTabs = annotateDuplicates(mergedTabs).map((tab) => ({
    ...tab,
    category: categorizeDomain(tab.domain, categoryRules),
    updatedAt: now
  }));

  const tabById = new Map<string, TabRecord>(dedupedTabs.map((tab) => [tab.id, tab]));
  const importedItems = freshTabs
    .map((tab) => tabById.get(tab.id))
    .filter((tab): tab is TabRecord => Boolean(tab));

  return {
    tabs: dedupedTabs,
    result: {
      items: importedItems,
      meta: {
        source,
        total: parserOutput.total,
        parsed: importedItems.length,
        invalid: parserOutput.invalid + additionalInvalid
      }
    }
  };
}
