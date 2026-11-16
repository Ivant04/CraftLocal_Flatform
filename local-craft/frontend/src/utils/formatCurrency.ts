export const formatCurrency = (amount?: number | null | unknown): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

export const formatCurrencyShort = (amount?: number | null | unknown): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return num.toLocaleString('vi-VN') + ' ₫';
};

export const formatUSD = (amount?: number | null | unknown): string => {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : Number(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};
