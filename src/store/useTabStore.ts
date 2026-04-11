import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_CATEGORY_RULES } from "../constants/categoryRules";
import { annotateDuplicates } from "../utils/dedupe";
import { runImportPipeline } from "../utils/importPipeline";
import { parseBySource } from "../utils/importers";
import { loadStoredTabs, saveStoredTabs } from "./storage";
import type { ImportMeta, ImportResult, ImportSource, TabRecord, UpdateTabPayload } from "../types/tab";

export interface TabStore {
  tabs: TabRecord[];
  lastImportMeta: ImportMeta | null;
  importFromText: (source: Extract<ImportSource, "onetab">, text: string) => Promise<ImportResult>;
  importFromFile: (source: Exclude<ImportSource, "onetab">, file: File) => Promise<ImportResult>;
  updateTab: (tabId: string, payload: UpdateTabPayload) => void;
  deleteTab: (tabId: string) => void;
  bulkUpdateCategory: (tabIds: string[], category: string) => void;
  bulkDeleteTabs: (tabIds: string[]) => void;
  clearAll: () => void;
}

function emptyImportResult(source: ImportSource): ImportResult {
  return {
    items: [],
    meta: {
      source,
      total: 0,
      parsed: 0,
      invalid: 0
    }
  };
}

export function useTabStore(): TabStore {
  const [tabs, setTabs] = useState<TabRecord[]>(() => loadStoredTabs());
  const [lastImportMeta, setLastImportMeta] = useState<ImportMeta | null>(null);
  const tabsRef = useRef<TabRecord[]>(tabs);

  useEffect(() => {
    tabsRef.current = tabs;
    saveStoredTabs(tabs);
  }, [tabs]);

  const runImport = useCallback(
    async (source: ImportSource, payload: { text?: string; file?: File }): Promise<ImportResult> => {
      const parserOutput = await parseBySource(source, payload);
      if (!parserOutput.total && !parserOutput.items.length) {
        return emptyImportResult(source);
      }

      const { tabs: nextTabs, result } = runImportPipeline({
        source,
        parserOutput,
        existingTabs: tabsRef.current,
        categoryRules: DEFAULT_CATEGORY_RULES
      });

      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      setLastImportMeta(result.meta);
      return result;
    },
    []
  );

  const importFromText = useCallback(
    async (source: Extract<ImportSource, "onetab">, text: string): Promise<ImportResult> => runImport(source, { text }),
    [runImport]
  );

  const importFromFile = useCallback(
    async (source: Exclude<ImportSource, "onetab">, file: File): Promise<ImportResult> => runImport(source, { file }),
    [runImport]
  );

  const clearAll = useCallback(() => {
    tabsRef.current = [];
    setTabs([]);
    setLastImportMeta(null);
  }, []);

  const updateTab = useCallback((tabId: string, payload: UpdateTabPayload) => {
    const now = new Date().toISOString();
    setTabs((previousTabs) => {
      const nextTabs = previousTabs.map((tab) => {
        if (tab.id !== tabId) {
          return tab;
        }
        return {
          ...tab,
          category: payload.category,
          tags: payload.tags,
          note: payload.note,
          updatedAt: now
        };
      });
      tabsRef.current = nextTabs;
      return nextTabs;
    });
  }, []);

  const deleteTab = useCallback((tabId: string) => {
    const now = new Date().toISOString();
    setTabs((previousTabs) => {
      const filteredTabs = previousTabs.filter((tab) => tab.id !== tabId);
      const reAnnotatedTabs = annotateDuplicates(filteredTabs).map((tab) => ({
        ...tab,
        updatedAt: now
      }));
      tabsRef.current = reAnnotatedTabs;
      return reAnnotatedTabs;
    });
  }, []);

  const bulkUpdateCategory = useCallback((tabIds: string[], category: string) => {
    if (!tabIds.length) {
      return;
    }
    const targetIds = new Set(tabIds);
    const now = new Date().toISOString();

    setTabs((previousTabs) => {
      const nextTabs = previousTabs.map((tab) => {
        if (!targetIds.has(tab.id)) {
          return tab;
        }
        return {
          ...tab,
          category,
          updatedAt: now
        };
      });
      tabsRef.current = nextTabs;
      return nextTabs;
    });
  }, []);

  const bulkDeleteTabs = useCallback((tabIds: string[]) => {
    if (!tabIds.length) {
      return;
    }
    const targetIds = new Set(tabIds);
    const now = new Date().toISOString();

    setTabs((previousTabs) => {
      const filteredTabs = previousTabs.filter((tab) => !targetIds.has(tab.id));
      const reAnnotatedTabs = annotateDuplicates(filteredTabs).map((tab) => ({
        ...tab,
        updatedAt: now
      }));
      tabsRef.current = reAnnotatedTabs;
      return reAnnotatedTabs;
    });
  }, []);

  return useMemo(
    () => ({
      tabs,
      lastImportMeta,
      importFromText,
      importFromFile,
      updateTab,
      deleteTab,
      bulkUpdateCategory,
      bulkDeleteTabs,
      clearAll
    }),
    [tabs, lastImportMeta, importFromText, importFromFile, updateTab, deleteTab, bulkUpdateCategory, bulkDeleteTabs, clearAll]
  );
}
