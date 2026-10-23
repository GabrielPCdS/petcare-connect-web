export function hojeIso(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function isoParaBr(iso: string): string {
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** "15/10/2026" + "14:00" -> milissegundos (para ordenar) */
export function timestamp(data: string, hora: string): number {
  const [d, m, a] = data.split('/').map(Number);
  const [h, min] = hora.split(':').map(Number);
  const t = new Date(a, m - 1, d, h || 0, min || 0).getTime();
  return Number.isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
}