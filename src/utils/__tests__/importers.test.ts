import { describe, expect, it } from "vitest";
import { parseBookmarkHtmlText } from "../importers/bookmarkHtmlImporter";
import { parseOneTabText } from "../importers/oneTabImporter";

describe("OneTab importer", () => {
  it("parses url and title pairs", () => {
    const text = [
      "https://github.com | GitHub",
      "MDN | https://developer.mozilla.org",
      "invalid line"
    ].join("\n");

    const parsed = parseOneTabText(text);
    expect(parsed.total).toBe(3);
    expect(parsed.invalid).toBe(1);
    expect(parsed.items).toHaveLength(2);
    expect(parsed.items[0].url).toBe("https://github.com");
  });
});

describe("Bookmark HTML importer", () => {
  it("extracts anchor href and text", () => {
    const html = `
      <DL><p>
      <DT><A HREF="https://example.com">Example</A>
      <DT><A HREF="https://news.ycombinator.com">HN</A>
      </DL>
    `;
    const parsed = parseBookmarkHtmlText(html);
    expect(parsed.total).toBe(2);
    expect(parsed.invalid).toBe(0);
    expect(parsed.items[1]).toEqual({ title: "HN", url: "https://news.ycombinator.com" });
  });
});
