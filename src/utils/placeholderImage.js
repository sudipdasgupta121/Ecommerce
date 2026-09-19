// Generates a self-contained SVG data URI as a product image placeholder.
// Using an inline SVG (rather than a random stock-photo service) guarantees the
// image actually matches the product and doesn't depend on an external network call.
export function svgPlaceholder({ emoji, bg }) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
      <rect width="600" height="600" fill="${bg}" />
      <text x="50%" y="52%" font-size="240" text-anchor="middle" dominant-baseline="central">${emoji}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
