import type { ImportMeta, TabRecord } from "../types/tab";
import { getSourceLabel } from "../utils/display";

interface DashboardHeaderProps {
  tabs: TabRecord[];
  lastImportMeta: ImportMeta | null;
  onClearAll: () => void;
}

function formatImportMeta(meta: ImportMeta | null): string {
  if (!meta) {
    return "暂无最近导入记录";
  }
  return `${getSourceLabel(meta.source)}：已解析 ${meta.parsed}/${meta.total}，无效 ${meta.invalid}`;
}

export default function DashboardHeader({ tabs, lastImportMeta, onClearAll }: DashboardHeaderProps): JSX.Element {
  const duplicateCount = tabs.filter((tab) => tab.isDuplicate).length;
  const uniqueCount = tabs.length - duplicateCount;
  const categoryCount = new Set(tabs.map((tab) => tab.category)).size;

  const statCards = [
    { label: "标签总数", value: tabs.length },
    { label: "唯一标签", value: uniqueCount },
    { label: "重复标签", value: duplicateCount },
    { label: "分类数量", value: categoryCount }
  ];

  return (
    <header className="animate-rise rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">浏览器标签可视化管理工具</h1>
          <p className="mt-1 text-sm text-slate-600">{formatImportMeta(lastImportMeta)}</p>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-ember hover:text-ember"
        >
          清空全部
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{card.value}</p>
          </div>
        ))}
      </div>
    </header>
  );
}
