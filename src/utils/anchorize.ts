export function anchorize(input: string, prefix = 'section') {
  const normalized = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!normalized) return prefix;
  return prefix ? `${prefix}-${normalized}` : normalized;
}
