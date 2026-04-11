import { describe, expect, it } from "vitest";
import { normalizeUrl } from "../url";

describe("normalizeUrl", () => {
  it("removes hash and tracking query params", () => {
    const normalized = normalizeUrl("https://Example.com/path/?utm_source=x&b=2&a=1#section");
    expect(normalized).toBe("https://example.com/path?a=1&b=2");
  });

  it("treats trailing slash and case as the same url", () => {
    const left = normalizeUrl("https://example.com/test/");
    const right = normalizeUrl("https://EXAMPLE.com/test");
    expect(left).toBe(right);
  });

  it("returns null for unsupported protocols", () => {
    expect(normalizeUrl("file:///tmp/test")).toBeNull();
  });
});
