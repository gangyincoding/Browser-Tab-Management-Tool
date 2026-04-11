import type { TabRecord } from "../types/tab";

const STORAGE_KEY = "tab_manager_state";
const STORAGE_VERSION = 1;

interface PersistedTabState {
  version: number;
  tabs: TabRecord[];
}

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  Uncategorized: "未分类",
  Development: "开发技术",
  Productivity: "效率工具",
  Learning: "学习课程",
  News: "新闻资讯",
  Social: "社交社区",
  Video: "视频内容",
  Shopping: "购物电商"
};

function normalizeLegacyCategory(category: string): string {
  return LEGACY_CATEGORY_MAP[category] ?? category;
}

function isTabRecord(input: unknown): input is TabRecord {
  if (!input || typeof input !== "object") {
    return false;
  }
  const tab = input as Record<string, unknown>;
  return (
    typeof tab.id === "string" &&
    typeof tab.title === "string" &&
    typeof tab.url === "string" &&
    typeof tab.normalizedUrl === "string" &&
    typeof tab.domain === "string" &&
    typeof tab.source === "string" &&
    typeof tab.category === "string" &&
    (Array.isArray(tab.tags) || typeof tab.tags === "undefined") &&
    (typeof tab.note === "string" || typeof tab.note === "undefined") &&
    typeof tab.hash === "string" &&
    typeof tab.isDuplicate === "boolean" &&
    (typeof tab.duplicateOf === "string" || tab.duplicateOf === null) &&
    typeof tab.createdAt === "string" &&
    typeof tab.updatedAt === "string"
  );
}

export function loadStoredTabs(): TabRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as PersistedTabState;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.tabs)) {
      return [];
    }
    return parsed.tabs.filter((entry) => isTabRecord(entry)).map((entry) => ({
      ...entry,
      category: normalizeLegacyCategory(entry.category),
      tags: Array.isArray(entry.tags) ? entry.tags.filter((tag) => typeof tag === "string") : [],
      note: typeof entry.note === "string" ? entry.note : ""
    }));
  } catch {
    return [];
  }
}

export function saveStoredTabs(tabs: TabRecord[]): void {
  const payload: PersistedTabState = {
    version: STORAGE_VERSION,
    tabs
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
