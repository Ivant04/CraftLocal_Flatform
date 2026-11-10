import assert from 'node:assert/strict';
import { test } from 'node:test';
import { workshopLocation } from '../src/utils/workshopLocation.ts';

test('map uses real coordinates, including zero, and encodes the address fallback', () => {
  assert.equal(workshopLocation('Hội An', { lat: 0, lng: 0 }).destination, '0,0');
  const address = '12 A & B, Hội An';
  for (const coordinates of [undefined, { lat: NaN, lng: 108 }, { lat: 91, lng: 108 }, { lat: 15, lng: 181 }]) {
    const map = workshopLocation(address, coordinates);
    assert.equal(map.destination, address);
    assert.equal(new URL(map.directionsUrl).searchParams.get('destination'), address);
    assert.equal(new URL(map.embedUrl).searchParams.get('q'), address);
  }
  assert.equal(workshopLocation('').embedUrl, '');
  assert.equal(workshopLocation('').directionsUrl, '');
});
