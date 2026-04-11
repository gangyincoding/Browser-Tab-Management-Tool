const TRACKING_PARAM_PATTERN = /^(utm_|fbclid$|gclid$|mc_eid$|mc_cid$)/i;
const DOMAIN_LIKE_PATTERN = /^[\w.-]+\.[a-z]{2,}([/:?#].*)?$/i;

function normalizeInputUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (DOMAIN_LIKE_PATTERN.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function normalizeUrl(rawUrl: string): string | null {
  try {
    const prepared = normalizeInputUrl(rawUrl);
    if (!prepared) {
      return null;
    }

    const url = new URL(prepared);
    if (!/^https?:$/i.test(url.protocol)) {
      return null;
    }

    url.hostname = url.hostname.toLowerCase();
    if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) {
      url.port = "";
    }

    const pathname = url.pathname.replace(/\/+$/, "");
    url.pathname = pathname || "/";
    url.hash = "";

    const retainedParams = [...url.searchParams.entries()]
      .filter(([key]) => !TRACKING_PARAM_PATTERN.test(key))
      .sort(([left], [right]) => left.localeCompare(right));

    url.search = "";
    for (const [key, value] of retainedParams) {
      url.searchParams.append(key, value);
    }

    const normalized = url.toString().replace(/\/$/, "");
    return normalized;
  } catch {
    return null;
  }
}

export function extractDomain(urlValue: string): string {
  try {
    const url = new URL(urlValue);
    return url.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

export function normalizeTitle(title: string): string {
  return title.trim().replace(/\s+/g, " ");
}

export function fallbackTitleFromDomain(domain: string): string {
  return domain || "未命名标签";
}
