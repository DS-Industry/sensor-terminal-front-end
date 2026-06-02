export function normalizeOrderId(id: string | number | undefined | null): string | undefined {
  if (id === undefined || id === null || id === '') {
    return undefined;
  }
  return String(id);
}

export function orderIdsMatch(
  a: string | number | undefined | null,
  b: string | number | undefined | null
): boolean {
  const normalizedA = normalizeOrderId(a);
  const normalizedB = normalizeOrderId(b);
  if (!normalizedA || !normalizedB) {
    return false;
  }
  return normalizedA === normalizedB;
}
