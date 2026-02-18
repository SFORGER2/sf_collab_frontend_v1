export function plotCount(count) {
  if (count > 9) {
    return "9+";
  }
  return count.toString();
}