export default function (value) {
  if (!value) {
    return false;
  }
  return Object.getPrototypeOf(value) === null || Object === value.constructor;
}