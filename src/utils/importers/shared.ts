export async function readFileAsText(file: File): Promise<string> {
  return file.text();
}

export function splitNonEmptyLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
