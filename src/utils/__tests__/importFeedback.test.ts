import { describe, expect, it } from "vitest";
import type { ImportResult } from "../../types/tab";
import { buildImportErrorFeedback, buildImportFeedback } from "../importFeedback";

function createImportResult(overrides?: Partial<ImportResult>): ImportResult {
  return {
    items: [],
    meta: {
      source: "onetab",
      total: 0,
      parsed: 0,
      invalid: 0
    },
    ...overrides
  };
}

describe("buildImportFeedback", () => {
  it("returns warning when total is zero", () => {
    const feedback = buildImportFeedback(createImportResult());
    expect(feedback.kind).toBe("warning");
  });

  it("returns warning when parsed is zero but total exists", () => {
    const feedback = buildImportFeedback(
      createImportResult({
        meta: { source: "onetab", total: 4, parsed: 0, invalid: 4 }
      })
    );
    expect(feedback.kind).toBe("warning");
    expect(feedback.message).toContain("未解析出有效链接");
  });

  it("returns success when parsed tabs exist", () => {
    const feedback = buildImportFeedback(
      createImportResult({
        meta: { source: "onetab", total: 5, parsed: 3, invalid: 2 },
        items: [
          {
            id: "1",
            title: "a",
            url: "https://example.com/a",
            normalizedUrl: "https://example.com/a",
            domain: "example.com",
            source: "onetab",
            category: "未分类",
            tags: [],
            note: "",
            hash: "h1",
            isDuplicate: false,
            duplicateOf: null,
            createdAt: "2026-04-12T00:00:00.000Z",
            updatedAt: "2026-04-12T00:00:00.000Z"
          }
        ]
      })
    );
    expect(feedback.kind).toBe("success");
  });
});

describe("buildImportErrorFeedback", () => {
  it("uses fallback message for unknown errors", () => {
    const feedback = buildImportErrorFeedback("书签 HTML", null);
    expect(feedback.kind).toBe("error");
    expect(feedback.message).toContain("解析异常");
  });

  it("uses error message when provided", () => {
    const feedback = buildImportErrorFeedback("OneTab 文本", new Error("文件读取失败"));
    expect(feedback.message).toContain("文件读取失败");
  });
});
