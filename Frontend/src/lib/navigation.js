/** Free deep link that opens turn-by-turn directions in Google Maps (no API key needed). */
export const directionsUrl = (destination, coords) => {
  const target = coords?.lat ? `${coords.lat},${coords.lng}` : destination;
  return `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${encodeURIComponent(target)}`;
};
