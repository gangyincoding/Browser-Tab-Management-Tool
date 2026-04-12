import { describe, expect, it } from "vitest";
import { getUniqueVisibleTabIds } from "../selection";

describe("getUniqueVisibleTabIds", () => {
  it("returns only non-duplicate ids", () => {
    const result = getUniqueVisibleTabIds([
      { id: "a", isDuplicate: false },
      { id: "b", isDuplicate: true },
      { id: "c", isDuplicate: false }
    ]);

    expect(result).toEqual(["a", "c"]);
  });

  it("returns empty array when all are duplicates", () => {
    const result = getUniqueVisibleTabIds([
      { id: "a", isDuplicate: true },
      { id: "b", isDuplicate: true }
    ]);

    expect(result).toEqual([]);
  });
});
