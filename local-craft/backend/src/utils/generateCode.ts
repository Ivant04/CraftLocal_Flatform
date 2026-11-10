/**
 * Tạo mã code theo format: PREFIX + YYYYMMDD + sequence
 */
export const generateCode = (prefix: string, seq: number): string => {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${prefix}${y}${m}${d}${String(seq).padStart(4, '0')}`;
};
