async page => {
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('Failed to load resource:')) errors.push(message.text()); });
  const base = 'http://localhost:5173/test/fixture.html';
  const photo = 'https://example.com/photo.jpg';
  const workshop = { _id: 'paid', title: 'Làm đèn lồng Hội An', description: 'Tự tay tạo một chiếc đèn lồng, tìm hiểu câu chuyện làng nghề và mang thành phẩm về nhà.', categoryId: { _id: '000000000000000000000002', name: 'Làm đèn lồng' }, address: { fullAddress: '12 Nguyễn Thái Học, Hội An, Quảng Nam' }, locationLabel: 'Hội An, Quảng Nam', mapLocation: { lat: 15.877, lng: 108.326 }, hostName: 'Xưởng thủ công Hội An', hostPhone: '0901234567', price: 250000, duration: 120, maxGuestsPerSlot: 8, images: [photo, `${photo}?2`, `${photo}?3`], includedItems: ['Nguyên liệu', 'Hướng dẫn thực hành', 'Thành phẩm mang về'], averageRating: 5, totalReviews: 1, promotion: { code: 'CRAFT10', percentOff: 10 } };
  const slot = { _id: '000000000000000000000003', startTime: '2030-12-20T02:00:00Z', endTime: '2030-12-20T04:00:00Z', price: 300000, availableSlots: 4, status: 'AVAILABLE' };
  let reviews = [{ _id: 'r1', bookingId: 'old', touristId: { fullName: 'Nguyễn An' }, rating: 5, comment: 'Rất vui và người hướng dẫn tận tình!', createdAt: '2026-11-01T00:00:00Z', hostReply: { message: 'Cảm ơn bạn đã ghé xưởng!', repliedAt: '2026-11-02T00:00:00Z' } }];
  let reviewFailed = true;
  let reviewSubmitted = false;
  let bookingCount = 0;
  let paymentCount = 0;
  let savedHost = null;
  let missingFails = true;
  await page.route('https://www.google.com/maps**', route => route.fulfill({ contentType: 'text/html', body: '<p>Google Maps fixture</p>' }));
  await page.route('https://example.com/photo.jpg**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="480"><defs><linearGradient id="g"><stop stop-color="#7a261d"/><stop offset="1" stop-color="#ebc376"/></linearGradient></defs><rect width="1200" height="480" fill="url(#g)"/><g fill="#ffd18a" stroke="#704728" stroke-width="6"><ellipse cx="300" cy="230" rx="100" ry="140"/><ellipse cx="600" cy="160" rx="120" ry="160"/><ellipse cx="930" cy="280" rx="110" ry="150"/></g><text x="50" y="440" font-size="26" fill="white">Ảnh minh họa kiểm thử slideshow</text></svg>' }));
  await page.route('http://localhost:5000/api/**', async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace('/api', '');
    const ok = data => route.fulfill({ json: { success: true, data } });
    const fail = message => route.fulfill({ status: 400, json: { success: false, message } });
    if (path === '/categories') return ok([{ _id: workshop.categoryId._id, name: 'Làm đèn lồng' }]);
    if (path === '/host/workshops/paid') { savedHost = request.postDataJSON(); return ok(savedHost); }
    if (path.startsWith('/workshops/') && path.endsWith('/timeslots')) return ok([slot, { ...slot, _id: 'full', status: 'FULL', availableSlots: 0 }]);
    if (path === '/workshops/missing' && missingFails) return route.fulfill({ status: 404, json: { message: 'Missing' } });
    if (path === '/workshops/free') return ok({ ...workshop, _id: 'free', price: 0, promotion: null });
    if (path.startsWith('/workshops/')) return ok(workshop);
    if (path.startsWith('/reviews/workshop/')) return ok(reviews);
    if (path === '/bookings/my-bookings') return ok([{ _id: '000000000000000000000004', workshopId: { _id: 'paid' }, bookingCode: 'BK-TEST', canReview: !reviewSubmitted }]);
    if (path === '/reviews' && request.method() === 'POST') {
      if (reviewFailed) { reviewFailed = false; return fail('Thử lại gửi đánh giá'); }
      const data = request.postDataJSON();
      check(data.rating === 4 && data.comment === 'Trải nghiệm rất đáng nhớ!', 'Review payload incorrect');
      reviewSubmitted = true;
      const created = { ...data, _id: 'r2', createdAt: new Date().toISOString() };
      reviews = [{ ...created, touristId: { fullName: 'Khách kiểm thử' } }, ...reviews];
      return ok(created);
    }
    if (path === '/bookings' && request.method() === 'POST') {
      bookingCount++;
      const data = request.postDataJSON();
      check(data.quantity === 2 && data.couponCode === 'CRAFT10' && data.timeslotId === slot._id, 'Booking payload incorrect');
      check(!('totalPrice' in data) && !('unitPrice' in data), 'Client is sending an authoritative price');
      return ok({ _id: 'pending-booking', totalPrice: 540000 });
    }
    if (path === '/payments/payos/create-booking-payment') { paymentCount++; return fail('Cổng thanh toán đang bận'); }
    throw new Error(`Unmocked API request ${request.method()} ${path}`);
  });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.clock.install();
  await page.goto(base);
  await page.getByRole('heading', { name: workshop.title }).waitFor();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(5100);
  await page.waitForFunction(() => document.querySelectorAll('.ws-dots button')[1]?.getAttribute('aria-pressed') === 'true');
  check(await page.getByRole('button', { name: 'Xem ảnh 2' }).getAttribute('aria-pressed') === 'true', 'Autoplay did not advance');
  await page.clock.resume();
  await page.getByRole('button', { name: 'Xem ảnh 1' }).click();
  check((await page.getByRole('link', { name: 'Chỉ đường', exact: true }).getAttribute('href')).includes('15.877%2C108.326'), 'Directions should use coordinates');
  await page.getByRole('button', { name: 'Ảnh tiếp theo', exact: true }).click();
  check(await page.getByRole('button', { name: 'Xem ảnh 2' }).getAttribute('aria-pressed') === 'true', 'Next slide failed');
  await page.getByRole('button', { name: 'Ảnh trước', exact: true }).click();
  await page.getByRole('button', { name: 'Tạm dừng slideshow' }).click();
  check(await page.getByRole('button', { name: 'Chạy slideshow' }).count() === 1, 'Pause control failed');
  await page.getByRole('button', { name: /Còn 4 chỗ/ }).click();
  await page.getByRole('button', { name: 'Đặt trải nghiệm' }).click();
  await page.getByRole('heading', { name: 'Đăng nhập', exact: true }).waitFor();

  await page.goto(`${base}?auth`);
  await page.getByRole('button', { name: /Còn 4 chỗ/ }).click();
  await page.getByLabel('Số khách', { exact: true }).fill('2');
  await page.getByLabel('Mã giảm giá', { exact: true }).fill('WRONG');
  await page.getByRole('button', { name: 'Áp dụng', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'không áp dụng' }).waitFor();
  await page.getByLabel('Mã giảm giá', { exact: true }).fill(' craft10 ');
  await page.getByRole('button', { name: 'Áp dụng', exact: true }).click();
  check((await page.locator('.ws-total').innerText()).includes('540.000'), 'Discount total should use selected slot price');
  await page.getByLabel('Số khách', { exact: true }).fill('0');
  check(await page.getByRole('button', { name: 'Đặt trải nghiệm' }).isDisabled(), 'Invalid guest count should block booking');
  await page.getByLabel('Số khách', { exact: true }).fill('2');
  await page.getByLabel('Cảm nhận của bạn').fill('Trải nghiệm rất đáng nhớ!');
  await page.getByRole('radio', { name: '4 sao', exact: true }).check();
  await page.getByRole('button', { name: 'Đăng đánh giá', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Thử lại gửi đánh giá' }).waitFor();
  check(await page.getByLabel('Cảm nhận của bạn').inputValue() === 'Trải nghiệm rất đáng nhớ!', 'Failed review lost draft');
  await page.getByRole('button', { name: 'Đăng đánh giá', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Đã đăng đánh giá' }).waitFor();
  check(await page.getByRole('button', { name: 'Đăng đánh giá', exact: true }).count() === 0, 'Submitted booking is still reviewable');
  await page.getByRole('button', { name: 'Đặt trải nghiệm' }).click();
  await page.getByRole('alert').filter({ hasText: 'Cổng thanh toán đang bận' }).waitFor();
  await Promise.all([page.waitForResponse(response => response.url().includes('create-booking-payment')), page.getByRole('button', { name: 'Thử lại thanh toán', exact: true }).click()]);
  check(bookingCount === 1 && paymentCount === 2, 'Payment retry created a duplicate booking');
  await page.setViewportSize({ width: 390, height: 844 });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile layout overflows');
  await page.screenshot({ path: '/tmp/craftlocal-workshop-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: '/tmp/craftlocal-workshop-desktop.png', fullPage: true });

  await page.goto(`${base}?id=free`);
  await page.getByRole('heading', { name: workshop.title }).waitFor();
  check(await page.getByLabel('Mã giảm giá', { exact: true }).count() === 0, 'Free workshop shows coupon controls');
  check(await page.getByRole('link', { name: 'Liên hệ đăng ký miễn phí' }).getAttribute('href') === 'tel:0901234567', 'Free contact missing');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.getByRole('heading', { name: workshop.title }).waitFor();
  check(await page.getByRole('button', { name: 'Tạm dừng slideshow' }).count() === 0, 'Reduced motion should disable autoplay');
  await page.clock.fastForward(5100);
  check(await page.getByRole('button', { name: 'Xem ảnh 1' }).getAttribute('aria-pressed') === 'true', 'Reduced motion still advances slides');
  await page.clock.resume();
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  await page.goto(`${base}?id=missing`);
  await page.getByRole('alert').filter({ hasText: 'Không tìm thấy workshop' }).waitFor();
  missingFails = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: workshop.title }).waitFor();

  await page.goto(`${base}?host`);
  await page.getByLabel('Tiêu đề', { exact: true }).waitFor();
  await page.getByLabel('Mã giảm giá', { exact: true }).fill('NEW20');
  await page.getByLabel('Giảm (%)', { exact: true }).fill('20');
  await page.getByRole('button', { name: 'Lưu Workshop' }).click();
  await page.getByText('Đã lưu workshop', { exact: true }).waitFor();
  check(savedHost.promotion.code === 'NEW20' && savedHost.promotion.percentOff === 20, 'Host discount was not saved');
  check(savedHost.images.length === 3 && savedHost.mapLocation.lat === 15.877, 'Host save lost photos or location');
  check(savedHost.address.fullAddress === workshop.address.fullAddress, 'Editing a promotion should preserve the existing address');
  check(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
  return { passed: true, bookingCount, paymentCount, reviewSubmitted, screenshots: ['/tmp/craftlocal-workshop-desktop.png', '/tmp/craftlocal-workshop-mobile.png'] };
}
