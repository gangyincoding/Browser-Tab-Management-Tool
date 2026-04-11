import { UNCATEGORIZED } from "../constants/categoryRules";
import type { CategoryRule } from "../types/tab";

function isDomainMatch(domain: string, pattern: string): boolean {
  const normalizedDomain = domain.toLowerCase();
  const normalizedPattern = pattern.toLowerCase();

  return (
    normalizedDomain === normalizedPattern ||
    normalizedDomain.endsWith(`.${normalizedPattern}`) ||
    normalizedDomain.includes(normalizedPattern)
  );
}

export function categorizeDomain(domain: string, rules: CategoryRule[]): string {
  if (!domain) {
    return UNCATEGORIZED;
  }

  const matchedRule = rules.find((rule) => rule.domainPatterns.some((pattern) => isDomainMatch(domain, pattern)));
  return matchedRule?.name ?? UNCATEGORIZED;
}
