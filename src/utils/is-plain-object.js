export default function isPlainObject(value) {
  if (!value) {
    return false;
  }
  return Object.getPrototypeOf(value) === null || Object === value.constructor;
}