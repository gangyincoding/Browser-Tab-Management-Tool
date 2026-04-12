import { useMemo } from "react";
import type { TabRecord } from "../../types/tab";
import StatePanel from "../StatePanel";

interface BoardViewProps {
  tabs: TabRecord[];
}

export default function BoardView({ tabs }: BoardViewProps): JSX.Element {
  const grouped = useMemo(() => {
    const map = new Map<string, TabRecord[]>();
    const uniqueTabs = tabs.filter((tab) => !tab.isDuplicate);

    for (const tab of uniqueTabs) {
      const current = map.get(tab.category) ?? [];
      current.push(tab);
      map.set(tab.category, current);
    }

    return [...map.entries()]
      .map(([category, items]) => ({
        category,
        items: items.sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
      }))
      .sort((left, right) => right.items.length - left.items.length);
  }, [tabs]);

  if (!grouped.length) {
    return (
      <section className="rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
        <StatePanel title="暂无看板数据" description="请先导入标签，或检查去重后是否仍有可展示内容。" variant="empty" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <h2 className="text-lg font-semibold text-ink">分类看板</h2>
      <p className="mt-1 text-sm text-slate-600">按域名规则自动分类并分组展示。</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {grouped.map((column) => (
          <article key={column.category} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink">{column.category}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {column.items.length}
              </span>
            </div>
            <ul className="space-y-2">
              {column.items.slice(0, 8).map((tab) => (
                <li key={tab.id} className="rounded-lg border border-slate-200 bg-white p-2 text-sm">
                  <a href={tab.url} target="_blank" rel="noreferrer" className="font-medium text-ink hover:text-tide">
                    {tab.title}
                  </a>
                  <p className="truncate text-xs text-slate-500">{tab.domain}</p>
                </li>
              ))}
            </ul>
            {column.items.length > 8 ? (
              <p className="mt-2 text-xs text-slate-500">+{column.items.length - 8} 个更多标签</p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
