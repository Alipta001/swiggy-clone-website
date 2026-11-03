/**
 * Formats a numeric price into INR currency format
 * @param {number|string} price 
 * @returns {string} e.g. "₹249" or "₹249.50"
 */
export function formatPrice(price) {
  const num = Number(price);
  if (isNaN(num)) return '₹0';
  return `₹${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
}

export default formatPrice;
