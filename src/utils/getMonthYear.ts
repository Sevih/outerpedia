// utils/getMonthYear.ts
export function getMonthYear() {
  const now = new Date();
  return now.toLocaleString('en-US', { month: 'long', year: 'numeric' }); // ex: "May 2025"
}
