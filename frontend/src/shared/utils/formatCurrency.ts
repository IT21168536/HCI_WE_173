/** Rs 1,050 — whole rupees, matching the WOKY designs. */
export function formatCurrency(value: number) {
  const rounded = Math.round(value);
  return `Rs ${rounded.toLocaleString('en-US')}`;
}
