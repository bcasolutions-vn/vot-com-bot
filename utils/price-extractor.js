/**
 * Extract price from dish name
 * @param {string} dishName - Dish name (may contain price like "42k")
 * @returns {number} Price in VND (e.g., 42000)
 *
 * Examples:
 * - "Ếch rim mắm tỏi (42k)" → 42000
 * - "Mực trứng rim ( 37k )" → 37000
 * - "Mực xào rau củ" → 32000 (default)
 */
function extractPrice(dishName) {
  // Regex: match digits followed by 'k' (case insensitive)
  // Handles: (42k), ( 42k ), (42K), 42k
  const match = dishName.match(/\(?\s*(\d+)k\s*\)?/i);

  if (match && match[1]) {
    const priceK = parseInt(match[1], 10);
    return priceK * 1000; // 42 → 42000
  }

  // Default price
  return 32000;
}

/**
 * Format price to Vietnamese Dong
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted string (e.g., "42.000₫")
 */
function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

module.exports = {
  extractPrice,
  formatVND
};
