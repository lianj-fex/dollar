export default function isNegativeZero(zero) {
  return zero === 0 && 1 / zero > 0;
}