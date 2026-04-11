import { useMemo, useState } from "react";
import DashboardHeader from "./components/DashboardHeader";
import ImportCenter from "./components/ImportCenter";
import BoardView from "./components/views/BoardView";
import ListView from "./components/views/ListView";
import StatsView from "./components/views/StatsView";
import { useTabStore } from "./store/useTabStore";

type ViewMode = "list" | "board" | "stats";

const VIEW_OPTIONS: Array<{ key: ViewMode; label: string }> = [
  { key: "list", label: "列表视图" },
  { key: "board", label: "分类看板" },
  { key: "stats", label: "统计图表" }
];

function ViewSwitcher({
  activeView,
  onChange
}: {
  activeView: ViewMode;
  onChange: (view: ViewMode) => void;
}): JSX.Element {
  return (
    <div className="inline-flex rounded-xl border border-slate-300 bg-white p-1 shadow-sm">
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onChange(option.key)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            option.key === activeView ? "bg-ink text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function App(): JSX.Element {
  const { tabs, lastImportMeta, importFromText, importFromFile, updateTab, deleteTab, bulkUpdateCategory, bulkDeleteTabs, clearAll } =
    useTabStore();
  const [activeView, setActiveView] = useState<ViewMode>("list");

  const activeViewNode = useMemo(() => {
    if (activeView === "board") {
      return <BoardView tabs={tabs} />;
    }
    if (activeView === "stats") {
      return <StatsView tabs={tabs} />;
    }
    return (
      <ListView
        tabs={tabs}
        onUpdateTab={updateTab}
        onDeleteTab={deleteTab}
        onBulkUpdateCategory={bulkUpdateCategory}
        onBulkDeleteTabs={bulkDeleteTabs}
      />
    );
  }, [activeView, tabs, updateTab, deleteTab, bulkUpdateCategory, bulkDeleteTabs]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <DashboardHeader tabs={tabs} lastImportMeta={lastImportMeta} onClearAll={clearAll} />

        <ImportCenter
          onImportOneTab={(text) => importFromText("onetab", text)}
          onImportBookmarkHtml={(file) => importFromFile("bookmark_html", file)}
          onImportChromeEdge={(file) => importFromFile("chrome_edge_file", file)}
        />

        <section className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">可视化工作区</h2>
          <ViewSwitcher activeView={activeView} onChange={setActiveView} />
        </section>

        {activeViewNode}
      </div>
    </main>
  );
}
