export function normalizeUrl(value) {
  if (typeof value !== 'string') {
    return '';
  }
  let trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  if (!/^https?:\/\//i.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function isValidURL(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = normalizeUrl(value);
  if (!normalized) {
    return false;
  }

  try {
    const parsedUrl = new URL(normalized);
    const host = parsedUrl.hostname.toLowerCase();

    if (!host || host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.startsWith('127.')) {
      return false;
    }

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

