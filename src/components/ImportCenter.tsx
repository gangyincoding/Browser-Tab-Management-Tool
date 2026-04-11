import { useState } from "react";
import type { ImportResult } from "../types/tab";

interface ImportCenterProps {
  onImportOneTab: (text: string) => Promise<ImportResult>;
  onImportBookmarkHtml: (file: File) => Promise<ImportResult>;
  onImportChromeEdge: (file: File) => Promise<ImportResult>;
}

interface Feedback {
  kind: "success" | "error";
  message: string;
}

function buildFeedbackMessage(result: ImportResult): Feedback {
  const duplicateCount = result.items.filter((item) => item.isDuplicate).length;
  return {
    kind: "success",
    message: `导入完成：已解析 ${result.meta.parsed}/${result.meta.total}，无效 ${result.meta.invalid}，重复 ${duplicateCount}。`
  };
}

export default function ImportCenter({
  onImportOneTab,
  onImportBookmarkHtml,
  onImportChromeEdge
}: ImportCenterProps): JSX.Element {
  const [oneTabText, setOneTabText] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [busy, setBusy] = useState(false);

  const handleOneTabImport = async (): Promise<void> => {
    if (!oneTabText.trim()) {
      setFeedback({ kind: "error", message: "OneTab 文本不能为空。" });
      return;
    }
    setBusy(true);
    try {
      const result = await onImportOneTab(oneTabText);
      setFeedback(buildFeedbackMessage(result));
      setOneTabText("");
    } catch {
      setFeedback({ kind: "error", message: "OneTab 文本导入失败。" });
    } finally {
      setBusy(false);
    }
  };

  const handleFileImport = async (
    file: File | undefined,
    handler: (file: File) => Promise<ImportResult>,
    failMessage: string
  ): Promise<void> => {
    if (!file) {
      return;
    }
    setBusy(true);
    try {
      const result = await handler(file);
      setFeedback(buildFeedbackMessage(result));
    } catch {
      setFeedback({ kind: "error", message: failMessage });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="animate-rise rounded-2xl bg-white/90 p-5 shadow-card backdrop-blur">
      <div className="mb-3">
        <h2 className="text-lg font-semibold text-ink">导入中心</h2>
        <p className="text-sm text-slate-600">支持来源：OneTab 文本、书签 HTML、Chrome/Edge 文件。</p>
      </div>

      {feedback ? (
        <div
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            feedback.kind === "success"
              ? "border-moss/40 bg-moss/10 text-green-900"
              : "border-ember/40 bg-ember/10 text-orange-900"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">OneTab 文本</h3>
          <textarea
            value={oneTabText}
            onChange={(event) => setOneTabText(event.target.value)}
            rows={7}
            placeholder="粘贴 OneTab 导出的文本..."
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none ring-0 transition focus:border-tide"
          />
          <button
            type="button"
            onClick={handleOneTabImport}
            disabled={busy}
            className="mt-3 w-full rounded-lg bg-ink px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
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
            className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-tide file:px-3 file:py-2 file:text-white hover:file:bg-sky-700"
            onChange={async (event) => {
              const [file] = event.target.files ?? [];
              await handleFileImport(file, onImportBookmarkHtml, "书签 HTML 导入失败。");
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
            className="mt-3 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-ember file:px-3 file:py-2 file:text-white hover:file:bg-orange-600"
            onChange={async (event) => {
              const [file] = event.target.files ?? [];
              await handleFileImport(file, onImportChromeEdge, "Chrome/Edge 文件导入失败。");
              event.currentTarget.value = "";
            }}
          />
        </article>
      </div>
    </section>
  );
}
