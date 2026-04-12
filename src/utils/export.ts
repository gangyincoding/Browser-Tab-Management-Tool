import type { TabRecord } from "../types/tab";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function buildExportTimestamp(date: Date = new Date()): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("") +
    "_" +
    [pad(date.getUTCHours()), pad(date.getUTCMinutes()), pad(date.getUTCSeconds())].join("");
}

export function buildTabsExportFilename(date: Date = new Date()): string {
  return `tabs_export_${buildExportTimestamp(date)}.json`;
}

export function buildTabsExportContent(tabs: TabRecord[], exportedAt: Date = new Date()): string {
  return JSON.stringify(
    {
      exportedAt: exportedAt.toISOString(),
      total: tabs.length,
      tabs
    },
    null,
    2
  );
}

export function downloadTabsAsJson(tabs: TabRecord[], now: Date = new Date()): string {
  const filename = buildTabsExportFilename(now);
  const content = buildTabsExportContent(tabs, now);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);

  return filename;
}
