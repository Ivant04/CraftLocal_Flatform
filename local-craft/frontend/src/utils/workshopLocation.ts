export function workshopLocation(address: string, coordinates?: { lat: number; lng: number }) {
  const valid = coordinates && Number.isFinite(coordinates.lat) && Math.abs(coordinates.lat) <= 90 &&
    Number.isFinite(coordinates.lng) && Math.abs(coordinates.lng) <= 180;
  const destination = valid ? `${coordinates.lat},${coordinates.lng}` : address.trim();
  return {
    destination,
    embedUrl: destination ? `https://www.google.com/maps?q=${encodeURIComponent(destination)}&output=embed` : '',
    directionsUrl: destination ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}` : '',
  };
}
