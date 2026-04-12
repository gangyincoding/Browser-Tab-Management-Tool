import type { ImportResult } from "../types/tab";

export type ImportFeedbackKind = "success" | "warning" | "error";

export interface ImportFeedback {
  kind: ImportFeedbackKind;
  message: string;
}

export function buildImportFeedback(result: ImportResult): ImportFeedback {
  const duplicateCount = result.items.filter((item) => item.isDuplicate).length;

  if (result.meta.total === 0) {
    return {
      kind: "warning",
      message: "未检测到可解析内容，请检查输入文本或文件。"
    };
  }

  if (result.meta.parsed === 0) {
    return {
      kind: "warning",
      message: `未解析出有效链接：总计 ${result.meta.total}，无效 ${result.meta.invalid}。请检查格式后重试。`
    };
  }

  return {
    kind: "success",
    message: `导入完成：已解析 ${result.meta.parsed}/${result.meta.total}，无效 ${result.meta.invalid}，重复 ${duplicateCount}。`
  };
}

export function buildImportErrorFeedback(sourceLabel: string, error: unknown): ImportFeedback {
  if (error instanceof Error && error.message.trim()) {
    return {
      kind: "error",
      message: `${sourceLabel}导入失败：${error.message}`
    };
  }

  return {
    kind: "error",
    message: `${sourceLabel}导入失败：解析异常，请检查文件或文本格式。`
  };
}
