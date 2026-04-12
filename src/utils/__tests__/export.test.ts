import { describe, expect, it } from "vitest";
import { buildTabsExportContent, buildTabsExportFilename } from "../export";
import type { TabRecord } from "../../types/tab";

function createMockTab(overrides?: Partial<TabRecord>): TabRecord {
  return {
    id: "tab_1",
    title: "Example",
    url: "https://example.com",
    normalizedUrl: "https://example.com",
    domain: "example.com",
    source: "onetab",
    category: "未分类",
    tags: [],
    note: "",
    hash: "12345678",
    isDuplicate: false,
    duplicateOf: null,
    createdAt: "2026-04-12T00:00:00.000Z",
    updatedAt: "2026-04-12T00:00:00.000Z",
    ...overrides
  };
}

describe("buildTabsExportFilename", () => {
  it("uses UTC timestamp in filename", () => {
    const filename = buildTabsExportFilename(new Date("2026-04-12T01:02:03.000Z"));
    expect(filename).toBe("tabs_export_20260412_010203.json");
  });
});

describe("buildTabsExportContent", () => {
  it("contains exportedAt, total and tabs", () => {
    const tabs = [createMockTab(), createMockTab({ id: "tab_2", url: "https://github.com", domain: "github.com" })];
    const content = buildTabsExportContent(tabs, new Date("2026-04-12T10:20:30.000Z"));
    const parsed = JSON.parse(content) as {
      exportedAt: string;
      total: number;
      tabs: TabRecord[];
    };

    expect(parsed.exportedAt).toBe("2026-04-12T10:20:30.000Z");
    expect(parsed.total).toBe(2);
    expect(parsed.tabs).toHaveLength(2);
    expect(parsed.tabs[1].domain).toBe("github.com");
  });
});
