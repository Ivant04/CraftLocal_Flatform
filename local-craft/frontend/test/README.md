# Workshop feature checks

Run the focused server, pricing and map tests with Node 22.15+:

```sh
cd local-craft/backend
npm ci
npm test
```

Run the isolated browser check using the installed Playwright CLI:

```sh
cd local-craft/frontend
npm ci
npm run dev -- --host 127.0.0.1
# In a second terminal, from this same directory:
playwright-cli -s=craftlocal open http://localhost:5173/test/fixture.html
playwright-cli -s=craftlocal run-code --filename=test/workshop-detail.browser.js
playwright-cli -s=craftlocal close
```

The fixture imports the production detail page, host form, components and API clients. Only authentication, HTTP responses, photos and the external map are test fixtures. It covers slideshow navigation/autoplay/reduced motion, directions, coupon totals/errors, guest limits, review submission/retry, payment retry without a second booking, host promotion editing and mobile overflow. Screenshots are written to `/tmp/craftlocal-workshop-{desktop,mobile}.png`. Generated screenshots, logs and reports stay outside Git; `Report/test-results/` is ignored.

These checks do not prove a live MongoDB write, Google Maps availability or a payOS transaction. The initial capture used base `fb6535fb92619ce2eb0333ce3d7f896179b9ff36`. After integration with newer main, TypeScript entrypoints exist, but the configured commands still reference absent files (`frontend/src/main.jsx`, `backend/src/server.js`); other startup issues remain outside these focused checks.

Each workshop supports one optional percentage code (1–99%). Hosts configure or remove it in the workshop form. A booking uses its selected timeslot's price; the server recalculates and stores the discount and final amount. Free workshops show a contact link for registration.

## Live read-only verification

With valid backend/frontend `.env` files and both packages installed:

```sh
cd local-craft/backend
node test/live-readonly.mjs
# In a second terminal:
cd local-craft/frontend
npm run dev -- --host 127.0.0.1
```

Open `http://localhost:5173/test/live.html?id=WORKSHOP_ID`. This entry imports the production workshop page and requests real MongoDB data through production public routes. The test server binds localhost, rejects writes with HTTP 405, and disables Mongoose automatic index/collection creation. It does not repair or replace the application's missing startup files.

`workshop-live.browser.js` captures the known live lantern workshop and verifies slideshow, live photos/reviews/prices, map tiles/directions, invalid coupon handling and mobile layout. It saves dated captures under `Report/test-results/2026-11-10`. Live booking, review submission and payOS execution are excluded.
