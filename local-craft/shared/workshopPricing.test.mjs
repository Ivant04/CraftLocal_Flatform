import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calculateWorkshopPrice, validatePromotion } from './workshopPricing.ts';

test('discount is opt-in, normalized and applied to the full booking in whole VND', () => {
  const promotion = validatePromotion({ code: ' craft10 ', percentOff: 10 });
  assert.equal(calculateWorkshopPrice(250000, 2, promotion).totalPrice, 500000);
  assert.deepEqual(calculateWorkshopPrice(250000, 2, promotion, ' craft10 '), {
    subtotal: 500000, discountAmount: 50000, totalPrice: 450000, couponCode: 'CRAFT10',
  });
  assert.equal(calculateWorkshopPrice(100001, 1, promotion, 'CRAFT10').totalPrice, 90001);
  assert.equal(calculateWorkshopPrice(1, 1, { code: 'SALE', percentOff: 99 }, 'SALE').totalPrice, 1);
});

test('free workshops do not need or accept a coupon; invalid money and quantity are rejected', () => {
  assert.equal(calculateWorkshopPrice(0, 2).totalPrice, 0);
  for (const price of [-1, NaN, Infinity, 1.5]) assert.throws(() => calculateWorkshopPrice(price, 1));
  for (const quantity of [0, -1, 1.5, NaN]) assert.throws(() => calculateWorkshopPrice(100000, quantity));
  assert.throws(() => calculateWorkshopPrice(Number.MAX_SAFE_INTEGER, 2));
  assert.throws(() => calculateWorkshopPrice(0, 1, { code: 'SALE', percentOff: 10 }, 'SALE'));
  assert.throws(() => calculateWorkshopPrice(100000, 1, null, 'WRONG'));
  assert.throws(() => calculateWorkshopPrice(100000, 1, { code: 'SALE', percentOff: 10 }, 'OTHER'));
  assert.throws(() => calculateWorkshopPrice(100000, 1, null, {}));
});

test('hosts can remove a promotion but cannot configure invalid discounts', () => {
  assert.equal(validatePromotion(null), null);
  for (const value of [{ code: 'A', percentOff: 10 }, { code: 'SALE', percentOff: 100 },
    { code: 'SALE', percentOff: -1 }, { code: 'SALE', percentOff: 0 }, { code: 'SALE', percentOff: 1.5 },
    { code: 'SALE', percentOff: '10' }, {}, 'SALE']) assert.throws(() => validatePromotion(value));
});
