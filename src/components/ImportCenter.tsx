import { useState } from "react";
import type { ImportResult } from "../types/tab";
import StatePanel from "./StatePanel";
import type { ImportFeedback } from "../utils/importFeedback";
import { buildImportErrorFeedback, buildImportFeedback } from "../utils/importFeedback";

interface ImportCenterProps {
  onImportOneTab: (text: string) => Promise<ImportResult>;
  onImportBookmarkHtml: (file: File) => Promise<ImportResult>;
  onImportChromeEdge: (file: File) => Promise<ImportResult>;
}

type BusySource = "onetab" | "bookmark" | "chrome_edge" | null;

function getBusyMessage(source: BusySource): string {
  if (source === "onetab") {
    return "正在解析 OneTab 文本，请稍候...";
  }
  if (source === "bookmark") {
    return "正在解析书签 HTML，请稍候...";
  }
  if (source === "chrome_edge") {
    return "正在解析 Chrome/Edge 文件，请稍候...";
  }
  return "";
}

export default function ImportCenter({
  onImportOneTab,
  onImportBookmarkHtml,
  onImportChromeEdge
}: ImportCenterProps): JSX.Element {
  const [oneTabText, setOneTabText] = useState("");
  const [feedback, setFeedback] = useState<ImportFeedback | null>(null);
  const [busySource, setBusySource] = useState<BusySource>(null);
  const busy = busySource !== null;

  const handleOneTabImport = async (): Promise<void> => {
    if (!oneTabText.trim()) {
      setFeedback({ kind: "warning", message: "OneTab 文本不能为空。" });
      return;
    }
    setBusySource("onetab");
    setFeedback(null);

    try {
      const result = await onImportOneTab(oneTabText);
      const nextFeedback = buildImportFeedback(result);
      setFeedback(nextFeedback);
      if (nextFeedback.kind === "success") {
        setOneTabText("");
      }
    } catch (error) {
      setFeedback(buildImportErrorFeedback("OneTab 文本", error));
    } finally {
      setBusySource(null);
    }
  };

  const handleFileImport = async (
    file: File | undefined,
    sourceLabel: string,
    source: BusySource,
    handler: (file: File) => Promise<ImportResult>
  ): Promise<void> => {
    if (!file) {
      return;
    }
    setBusySource(source);
    setFeedback(null);

    try {
      const result = await handler(file);
      setFeedback(buildImportFeedback(result));
    } catch (error) {
      setFeedback(buildImportErrorFeedback(sourceLabel, error));
    } finally {
      setBusySource(null);
    }
  };

  return (
    <section className="animate-rise rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-ink">导入中心</h2>
        <p className="text-sm text-slate-600">支持来源：OneTab 文本、书签 HTML、Chrome/Edge 文件。</p>
      </div>

      <div className="mb-4 space-y-2">
        {busy ? <StatePanel title="导入处理中" description={getBusyMessage(busySource)} variant="loading" compact /> : null}
        {feedback ? (
          <StatePanel
            title={feedback.kind === "success" ? "导入结果" : feedback.kind === "warning" ? "解析提示" : "导入失败"}
            description={feedback.message}
            variant={feedback.kind === "success" ? "info" : feedback.kind}
            compact
          />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-3" aria-busy={busy}>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">OneTab 文本</h3>
          <textarea
            value={oneTabText}
            onChange={(event) => setOneTabText(event.target.value)}
            rows={7}
            placeholder="粘贴 OneTab 导出的文本..."
            disabled={busy}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none ring-0 transition focus:border-tide disabled:cursor-not-allowed disabled:bg-slate-100"
          />
          <button
            type="button"
            onClick={handleOneTabImport}
            disabled={busy}
            className="mt-3 w-full rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            导入 OneTab
          </button>
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">书签 HTML</h3>
          <p className="mt-3 text-xs text-slate-600">上传浏览器导出的书签 HTML 文件。</p>
          <input
            type="file"
            accept=".html,.htm"
            disabled={busy}
            className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-tide file:px-3 file:py-2 file:text-white hover:file:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            onChange={async (event) => {
              const [file] = event.target.files ?? [];
              await handleFileImport(file, "书签 HTML", "bookmark", onImportBookmarkHtml);
              event.currentTarget.value = "";
            }}
          />
        </article>

        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Chrome/Edge 文件</h3>
            <span className="rounded-full bg-ember/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-900">
              第二阶段
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-600">上传工具/扩展导出的 JSON、HTML 或 TXT 标签数据文件。</p>
          <input
            type="file"
            accept=".json,.html,.htm,.txt"
            disabled={busy}
            className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-ember file:px-3 file:py-2 file:text-white hover:file:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            onChange={async (event) => {
              const [file] = event.target.files ?? [];
              await handleFileImport(file, "Chrome/Edge 文件", "chrome_edge", onImportChromeEdge);
              event.currentTarget.value = "";
            }}
          />
        </article>
      </div>
    </section>
  );
}
