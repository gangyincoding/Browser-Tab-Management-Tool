import { useEffect, useMemo, useState } from "react";
import type { DuplicateFilter, TabRecord, UpdateTabPayload } from "../../types/tab";
import { getSourceLabel } from "../../utils/display";
import { getUniqueVisibleTabIds } from "../../utils/selection";
import StatePanel from "../StatePanel";

interface ListViewProps {
  tabs: TabRecord[];
  onUpdateTab: (tabId: string, payload: UpdateTabPayload) => void;
  onDeleteTab: (tabId: string) => void;
  onBulkUpdateCategory: (tabIds: string[], category: string) => void;
  onBulkDeleteTabs: (tabIds: string[]) => void;
}

function parseTagsInput(input: string): string[] {
  const tags = input
    .split(/[,\uFF0C]/)
    .map((tag) => tag.trim())
    .filter(Boolean);

  return [...new Set(tags)];
}

function buildTagsInput(tags: string[]): string {
  return tags.join(", ");
}

export default function ListView({
  tabs,
  onUpdateTab,
  onDeleteTab,
  onBulkUpdateCategory,
  onBulkDeleteTabs
}: ListViewProps): JSX.Element {
  const [operationFeedback, setOperationFeedback] = useState<{
    kind: "success" | "warning";
    message: string;
  } | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [duplicateFilter, setDuplicateFilter] = useState<DuplicateFilter>("all");
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState("");
  const [editingTagsInput, setEditingTagsInput] = useState("");
  const [editingNote, setEditingNote] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkCategory, setBulkCategory] = useState("");

  const categories = useMemo(
    () => ["all", ...new Set(tabs.map((tab) => tab.category)).values()].sort((left, right) => left.localeCompare(right)),
    [tabs]
  );

  const availableCategoryOptions = useMemo(() => categories.filter((category) => category !== "all"), [categories]);

  useEffect(() => {
    if (availableCategoryOptions.includes(bulkCategory)) {
      return;
    }
    setBulkCategory(availableCategoryOptions[0] ?? "未分类");
  }, [availableCategoryOptions, bulkCategory]);

  const visibleTabs = useMemo(() => {
    const keyword = searchValue.trim().toLowerCase();

    return tabs
      .filter((tab) => {
        if (categoryFilter !== "all" && tab.category !== categoryFilter) {
          return false;
        }

        if (duplicateFilter === "unique" && tab.isDuplicate) {
          return false;
        }
        if (duplicateFilter === "duplicate" && !tab.isDuplicate) {
          return false;
        }

        if (!keyword) {
          return true;
        }
        return [tab.title, tab.url, tab.domain, tab.category, tab.tags.join(" "), tab.note]
          .join(" ")
          .toLowerCase()
          .includes(keyword);
      })
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }, [tabs, searchValue, categoryFilter, duplicateFilter]);

  useEffect(() => {
    const existingIds = new Set(tabs.map((tab) => tab.id));
    setSelectedIds((previous) => {
      const next = previous.filter((tabId) => existingIds.has(tabId));
      return next.length === previous.length ? previous : next;
    });
  }, [tabs]);

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleTabIds = useMemo(() => visibleTabs.map((tab) => tab.id), [visibleTabs]);
  const selectedVisibleCount = useMemo(
    () => visibleTabIds.filter((tabId) => selectedIdSet.has(tabId)).length,
    [visibleTabIds, selectedIdSet]
  );
  const allVisibleSelected = visibleTabs.length > 0 && selectedVisibleCount === visibleTabs.length;

  const editingTab = useMemo(() => tabs.find((tab) => tab.id === editingTabId) ?? null, [tabs, editingTabId]);

  const handleStartEdit = (tab: TabRecord): void => {
    setEditingTabId(tab.id);
    setEditingCategory(tab.category);
    setEditingTagsInput(buildTagsInput(tab.tags));
    setEditingNote(tab.note);
  };

  const handleCancelEdit = (): void => {
    setEditingTabId(null);
    setEditingCategory("");
    setEditingTagsInput("");
    setEditingNote("");
  };

  const handleSaveEdit = (): void => {
    if (!editingTabId) {
      return;
    }
    onUpdateTab(editingTabId, {
      category: editingCategory || "未分类",
      tags: parseTagsInput(editingTagsInput),
      note: editingNote.trim()
    });
    handleCancelEdit();
  };

  const handleDelete = (tab: TabRecord): void => {
    const confirmed = window.confirm(`确认删除标签「${tab.title}」吗？此操作不可撤销。`);
    if (!confirmed) {
      return;
    }
    onDeleteTab(tab.id);
    setSelectedIds((previous) => previous.filter((tabId) => tabId !== tab.id));
    if (editingTabId === tab.id) {
      handleCancelEdit();
    }
  };

  const handleToggleSelect = (tabId: string): void => {
    setSelectedIds((previous) => {
      if (previous.includes(tabId)) {
        return previous.filter((id) => id !== tabId);
      }
      return [...previous, tabId];
    });
  };

  const handleToggleSelectAllVisible = (): void => {
    setOperationFeedback(null);
    setSelectedIds((previous) => {
      const previousSet = new Set(previous);
      if (allVisibleSelected) {
        return previous.filter((tabId) => !visibleTabIds.includes(tabId));
      }

      for (const tabId of visibleTabIds) {
        previousSet.add(tabId);
      }
      return [...previousSet];
    });
  };

  const handleSelectUniqueVisible = (): void => {
    const uniqueIds = getUniqueVisibleTabIds(visibleTabs);
    if (!uniqueIds.length) {
      setOperationFeedback({
        kind: "warning",
        message: "当前筛选结果中没有可选的唯一标签。"
      });
      return;
    }
    setSelectedIds(uniqueIds);
    setOperationFeedback({
      kind: "success",
      message: `已选中当前筛选结果中的 ${uniqueIds.length} 个唯一标签。`
    });
  };

  const handleBulkUpdateCategory = (): void => {
    if (!selectedIds.length) {
      return;
    }
    onBulkUpdateCategory(selectedIds, bulkCategory || "未分类");
    setOperationFeedback({
      kind: "success",
      message: `批量改分类完成：已更新 ${selectedIds.length} 个标签到「${bulkCategory || "未分类"}」。`
    });
    setSelectedIds([]);
  };

  const handleBulkDelete = (): void => {
    if (!selectedIds.length) {
      return;
    }
    const confirmed = window.confirm(`确认批量删除 ${selectedIds.length} 个标签吗？此操作不可撤销。`);
    if (!confirmed) {
      return;
    }
    onBulkDeleteTabs(selectedIds);
    setOperationFeedback({
      kind: "success",
      message: `批量删除完成：已删除 ${selectedIds.length} 个标签。`
    });
    if (editingTabId && selectedIdSet.has(editingTabId)) {
      handleCancelEdit();
    }
    setSelectedIds([]);
  };

  const handleResetFilters = (): void => {
    setSearchValue("");
    setCategoryFilter("all");
    setDuplicateFilter("all");
    setOperationFeedback(null);
  };

  return (
    <section className="rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">标签列表</h2>
          <p className="text-sm text-slate-600">共 {visibleTabs.length} 条</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <input
            type="text"
            placeholder="搜索标题 / URL / 标签 / 备注..."
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
          />
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "全部分类" : category}
              </option>
            ))}
          </select>
          <select
            value={duplicateFilter}
            onChange={(event) => setDuplicateFilter(event.target.value as DuplicateFilter)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-tide"
          >
            <option value="all">全部状态</option>
            <option value="unique">仅唯一</option>
            <option value="duplicate">仅重复</option>
          </select>
        </div>
      </div>

      {operationFeedback ? (
        <div className="mt-4">
          <StatePanel
            title={operationFeedback.kind === "success" ? "批量操作结果" : "批量操作提示"}
            description={operationFeedback.message}
            variant={operationFeedback.kind}
            compact
          />
        </div>
      ) : null}

      {selectedIds.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="text-sm text-slate-700">已选中 {selectedIds.length} 项</span>
          <button
            type="button"
            onClick={handleSelectUniqueVisible}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-tide hover:text-tide"
          >
            仅选唯一项
          </button>
          <select
            value={bulkCategory}
            onChange={(event) => setBulkCategory(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none transition focus:border-tide"
          >
            {availableCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkUpdateCategory}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-tide hover:text-tide"
          >
            批量改分类
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            批量删除
          </button>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          >
            清空选择
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <StatePanel
            title="未选中标签"
            description="勾选标签后可进行批量改分类或批量删除。也可直接选择当前筛选结果中的唯一标签。"
            variant="info"
            actionLabel="选择当前唯一项"
            onAction={handleSelectUniqueVisible}
            compact
          />
        </div>
      )}

      {visibleTabs.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleToggleSelectAllVisible}
                    aria-label="全选当前筛选结果"
                  />
                </th>
                <th className="px-3 py-2">标题</th>
                <th className="px-3 py-2">域名</th>
                <th className="px-3 py-2">分类</th>
                <th className="px-3 py-2">来源</th>
                <th className="px-3 py-2">标签 / 备注</th>
                <th className="px-3 py-2">状态</th>
                <th className="px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {visibleTabs.map((tab) => (
                <tr key={tab.id} className="rounded-lg bg-slate-50 text-sm text-slate-700">
                  <td className="px-3 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIdSet.has(tab.id)}
                      onChange={() => handleToggleSelect(tab.id)}
                      aria-label={`选择标签 ${tab.title}`}
                    />
                  </td>
                  <td className="max-w-[260px] px-3 py-3">
                    <a
                      href={tab.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-ink hover:text-tide hover:underline"
                      title={tab.url}
                    >
                      {tab.title}
                    </a>
                    <p className="mt-1 truncate text-xs text-slate-500">{tab.url}</p>
                  </td>
                  <td className="px-3 py-3">{tab.domain}</td>
                  <td className="px-3 py-3">{tab.category}</td>
                  <td className="px-3 py-3">{getSourceLabel(tab.source)}</td>
                  <td className="max-w-[220px] px-3 py-3">
                    {tab.tags.length ? <p className="truncate text-xs text-slate-600">#{tab.tags.join(" #")}</p> : null}
                    {tab.note ? <p className="truncate text-xs text-slate-500">{tab.note}</p> : <p className="text-xs text-slate-400">无备注</p>}
                  </td>
                  <td className="px-3 py-3">
                    {tab.isDuplicate ? (
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">重复</span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">唯一</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(tab)}
                        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 transition hover:border-tide hover:text-tide"
                      >
                        编辑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tab)}
                        className="rounded-md border border-rose-300 px-2 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-4">
          {tabs.length ? (
            <StatePanel
              title="没有匹配结果"
              description="当前筛选条件下没有标签，建议清空筛选后重试。"
              variant="empty"
              actionLabel="清空筛选"
              onAction={handleResetFilters}
            />
          ) : (
            <StatePanel
              title="暂无标签数据"
              description="请先在导入中心导入 OneTab 文本、书签 HTML 或 Chrome/Edge 文件。"
              variant="empty"
            />
          )}
        </div>
      )}

      {editingTab ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-ink">编辑标签</h3>
              <p className="truncate text-xs text-slate-500">{editingTab.title}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">分类</span>
                <select
                  value={editingCategory}
                  onChange={(event) => setEditingCategory(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-tide"
                >
                  {availableCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">标签（英文逗号或中文逗号分隔）</span>
                <input
                  type="text"
                  value={editingTagsInput}
                  onChange={(event) => setEditingTagsInput(event.target.value)}
                  placeholder="例如：前端, React, 工具"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-tide"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">备注</span>
                <textarea
                  rows={4}
                  value={editingNote}
                  onChange={(event) => setEditingNote(event.target.value)}
                  placeholder="输入备注..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-tide"
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
