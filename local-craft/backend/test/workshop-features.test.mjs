import assert from 'node:assert/strict';
import { test, mock } from 'node:test';
import { registerHooks } from 'node:module';

// The repository's TypeScript imports omit extensions; keep the tests runnable with Node 22 alone.
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context); }
  catch (error) {
    if (specifier.startsWith('.') && !/\.[cm]?[jt]s$/.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    throw error;
  }
} });

const { default: Timeslot } = await import('../src/models/timeslot.model.ts');
const { default: Workshop } = await import('../src/models/workshop.model.ts');
const { default: Booking } = await import('../src/models/booking.model.ts');
const { default: Review } = await import('../src/models/review.model.ts');
const { BookingService } = await import('../src/services/booking.service.ts');
const { createReview, getWorkshopReviews } = await import('../src/controllers/review.controller.ts');
const { getMyBookings } = await import('../src/controllers/booking.controller.ts');
const { createBookingSchema } = await import('../src/validations/booking.validation.ts');
const { createReviewSchema } = await import('../src/validations/review.validation.ts');
const { createWorkshopSchema, updateWorkshopSchema } = await import('../src/validations/workshop.validation.ts');

const touristId = '000000000000000000000001';
const workshopId = '000000000000000000000002';
const slotId = '000000000000000000000003';
const bookingId = '000000000000000000000004';
function response() {
  return { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
async function invoke(handler, req) {
  const res = response();
  await handler(req, res, (error) => { throw error; });
  return res;
}

test('booking uses authoritative slot price and persists the normalized discount, never a client total', async () => {
  mock.method(Timeslot, 'findById', async () => ({ _id: slotId, workshopId, hostId: 'host', price: 300000, availableSlots: 8, status: 'AVAILABLE', startTime: new Date(Date.now() + 86400000) }));
  mock.method(Workshop, 'findById', async () => ({ price: 1, status: 'ACTIVE', maxGuestsPerSlot: 6, promotion: { code: 'CRAFT10', percentOff: 10 } }));
  const create = mock.method(Booking, 'create', async (value) => value);
  try {
    const result = await BookingService.createBooking(touristId, slotId, 2, ' craft10 ');
    assert.equal(result.unitPrice, 300000);
    assert.equal(result.totalPrice, 540000);
    assert.equal(result.discountAmount, 60000);
    assert.equal(result.couponCode, 'CRAFT10');
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 2, 'WRONG'), /không áp dụng/);
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 9), /Không đủ chỗ/);
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 7), /tối đa/);
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, -1), /Số khách/);
    assert.equal(create.mock.callCount(), 1);
  } finally { mock.restoreAll(); }
});

test('closed, past and inactive workshops reject booking without writing', async () => {
  let slot = { status: 'FULL', availableSlots: 8, startTime: new Date(Date.now() + 86400000) };
  mock.method(Timeslot, 'findById', async () => slot);
  mock.method(Workshop, 'findById', async () => ({ status: 'HIDDEN' }));
  const create = mock.method(Booking, 'create', async () => { throw new Error('Unexpected write'); });
  try {
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 1), /không khả dụng/);
    slot = { ...slot, status: 'AVAILABLE', startTime: new Date(0) };
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 1), /không khả dụng/);
    slot.startTime = new Date(Date.now() + 86400000);
    await assert.rejects(() => BookingService.createBooking(touristId, slotId, 1), /không khả dụng/);
    assert.equal(create.mock.callCount(), 0);
  } finally { mock.restoreAll(); }
});

test('reviews require ownership and attendance and reject repeat submissions', async () => {
  let booking = null;
  let existing = null;
  mock.method(Booking, 'findOne', async (query) => { assert.equal(query.touristId, touristId); return booking; });
  mock.method(Review, 'findOne', async () => existing);
  const create = mock.method(Review, 'create', async (value) => value);
  mock.method(Review, 'find', async () => [{ rating: 5 }, { rating: 4 }]);
  const update = mock.method(Workshop, 'findByIdAndUpdate', async () => ({}));
  const req = { user: { _id: touristId }, body: { bookingId, rating: 4, comment: 'Rất vui!' } };
  try {
    assert.equal((await invoke(createReview, req)).statusCode, 404);
    booking = { bookingStatus: 'PENDING', workshopId, hostId: 'host' };
    assert.equal((await invoke(createReview, req)).statusCode, 400);
    booking.bookingStatus = 'COMPLETED';
    existing = {};
    assert.equal((await invoke(createReview, req)).statusCode, 400);
    existing = null;
    assert.equal((await invoke(createReview, req)).statusCode, 201);
    assert.equal(create.mock.callCount(), 1);
    assert.deepEqual(update.mock.calls[0].arguments, [workshopId, { averageRating: 4.5, totalReviews: 2 }]);
  } finally { mock.restoreAll(); }
});

test('public feedback only returns visible reviews and eligibility also excludes hidden previous reviews', async () => {
  mock.method(Review, 'find', (query) => {
    assert.equal(query.status, 'VISIBLE');
    assert.equal(query.workshopId, workshopId);
    return { populate: () => ({ sort: async () => [{ rating: 5 }] }) };
  });
  mock.method(Booking, 'find', () => ({ populate() { return this; }, sort: async () => [
    { _id: bookingId, bookingStatus: 'COMPLETED', toObject() { return { _id: this._id }; } },
    { _id: 'other', bookingStatus: 'CHECKED_IN', toObject() { return { _id: this._id }; } },
    { _id: 'pending', bookingStatus: 'PENDING', toObject() { return { _id: this._id }; } },
  ] }));
  mock.method(Review, 'distinct', async (_field, query) => { assert.equal(query.touristId, touristId); return [bookingId]; });
  try {
    assert.equal((await invoke(getWorkshopReviews, { params: { workshopId } })).body.data.length, 1);
    assert.deepEqual((await invoke(getMyBookings, { user: { _id: touristId } })).body.data.map((value) => value.canReview), [false, true, false]);
  } finally { mock.restoreAll(); }
});

test('HTTP schemas reject bad ratings, quantities and host discounts', () => {
  assert.equal(createBookingSchema.safeParse({ timeslotId: slotId, quantity: 1, couponCode: ' CRAFT10 ' }).success, true);
  for (const quantity of [-1, 0, 1.5, '2']) assert.equal(createBookingSchema.safeParse({ timeslotId: slotId, quantity }).success, false);
  for (const rating of [0, 6, 4.5, '5']) assert.equal(createReviewSchema.safeParse({ bookingId, rating, comment: 'Good' }).success, false);
  assert.equal(createReviewSchema.safeParse({ bookingId, rating: 5, comment: '  ' }).success, false);
  const workshop = { title: 'Workshop', description: 'Description', categoryId: workshopId, address: 'Hội An', locationLabel: 'Hội An', mapLocation: { lat: 15.8, lng: 108.3 }, price: 100000, duration: 90, maxGuestsPerSlot: 8, images: ['https://example.com/photo.jpg'], promotion: { code: ' craft10 ', percentOff: 10 } };
  assert.equal(createWorkshopSchema.parse(workshop).promotion.code, 'CRAFT10');
  assert.equal(createWorkshopSchema.safeParse({ ...workshop, images: ['/images/workshop-01.jpg'] }).success, true);
  assert.equal(createWorkshopSchema.safeParse({ ...workshop, images: ['javascript:alert(1)'] }).success, false);
  assert.equal(createWorkshopSchema.safeParse({ ...workshop, images: ['//example.com/photo.jpg'] }).success, false);
  assert.equal(createWorkshopSchema.safeParse({ ...workshop, promotion: { code: 'CRAFT', percentOff: 100 } }).success, false);
  assert.equal(updateWorkshopSchema.parse({ promotion: null }).promotion, null);
});
