/**
 * Format currency amount to INR (₹)
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);
};

/**
 * Format timestamp to readable date/time
 * @param {Date | number | string} date
 * @returns {string}
 */
export const formatDateTime = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
};

