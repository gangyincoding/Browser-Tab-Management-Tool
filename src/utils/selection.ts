import type { TabRecord } from "../types/tab";

export function getUniqueVisibleTabIds(tabs: Pick<TabRecord, "id" | "isDuplicate">[]): string[] {
  return tabs.filter((tab) => !tab.isDuplicate).map((tab) => tab.id);
}
