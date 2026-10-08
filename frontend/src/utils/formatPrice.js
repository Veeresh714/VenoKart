// Formats a number as Indian Rupees using proper locale rules -
// e.g. 123456.5 -> "₹1,23,456.50" (note the Indian "lakh" comma grouping,
// different from the Western "123,456.50" grouping). Intl.NumberFormat
// handles this correctly for us instead of us hand-rolling comma logic.
export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};
