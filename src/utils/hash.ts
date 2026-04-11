export function createStableHash(value: string): string {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function createTabId(): string {
  if ("randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `tab_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
