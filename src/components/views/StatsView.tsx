import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TabRecord } from "../../types/tab";
import { getSourceLabel } from "../../utils/display";

interface StatsViewProps {
  tabs: TabRecord[];
}

const CHART_COLORS = ["#0D1B2A", "#6CA6C1", "#F47C48", "#6E9E75", "#D1A054", "#8C93A8"];

export default function StatsView({ tabs }: StatsViewProps): JSX.Element {
  const uniqueTabs = useMemo(() => tabs.filter((tab) => !tab.isDuplicate), [tabs]);

  const categoryStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tab of uniqueTabs) {
      counts.set(tab.category, (counts.get(tab.category) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value);
  }, [uniqueTabs]);

  const sourceStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tab of tabs) {
      const sourceLabel = getSourceLabel(tab.source);
      counts.set(sourceLabel, (counts.get(sourceLabel) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, value]) => ({ name, value }));
  }, [tabs]);

  if (!tabs.length) {
    return (
      <section className="rounded-2xl bg-white/90 p-6 text-center text-slate-600 shadow-card backdrop-blur">
        暂无数据，请先导入标签后生成统计图。
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <h2 className="text-lg font-semibold text-ink">统计图表</h2>
      <p className="mt-1 text-sm text-slate-600">展示分类分布与导入来源分布。</p>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">分类分布（去重后）</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {categoryStats.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">导入来源分布</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sourceStats} dataKey="value" nameKey="name" outerRadius={112} label>
                  {sourceStats.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </section>
  );
}
