export interface WorkshopPromotion {
  code: string;
  percentOff: number;
}

export class WorkshopInputError extends Error {
  statusCode = 400;
}

export function validatePromotion(value: unknown): WorkshopPromotion | null {
  if (value === null) return null;
  if (!value || typeof value !== 'object') throw new WorkshopInputError('Mã giảm giá không hợp lệ');
  const { code, percentOff } = value as WorkshopPromotion;
  if (typeof code !== 'string' || !/^[A-Z0-9_-]{3,32}$/.test(code.trim().toUpperCase()) ||
      !Number.isInteger(percentOff) || percentOff < 1 || percentOff > 99) {
    throw new WorkshopInputError('Mã gồm 3–32 chữ, số, dấu _ hoặc -; mức giảm từ 1 đến 99%');
  }
  return { code: code.trim().toUpperCase(), percentOff };
}

export function calculateWorkshopPrice(unitPrice: number, quantity: number, promotion?: WorkshopPromotion | null, couponCode = '') {
  if (!Number.isSafeInteger(unitPrice) || unitPrice < 0 || !Number.isSafeInteger(quantity) || quantity < 1 ||
      !Number.isSafeInteger(unitPrice * quantity)) {
    throw new WorkshopInputError('Giá hoặc số khách không hợp lệ');
  }
  if (typeof couponCode !== 'string') throw new WorkshopInputError('Mã giảm giá không hợp lệ');
  const code = couponCode.trim().toUpperCase();
  const validPromotion = promotion ? validatePromotion(promotion) : null;
  if (code && (unitPrice === 0 || !validPromotion || validPromotion.code !== code)) {
    throw new WorkshopInputError('Mã giảm giá không áp dụng cho khung giờ này');
  }
  const subtotal = unitPrice * quantity;
  const discountAmount = code && validPromotion ? Number(BigInt(subtotal) * BigInt(validPromotion.percentOff) / 100n) : 0;
  return { subtotal, discountAmount, totalPrice: subtotal - discountAmount, couponCode: code || undefined };
}
