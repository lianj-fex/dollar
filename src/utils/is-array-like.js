export default function (value, complex) {
  return value
    && typeof value === 'object'
    && typeof value.length === 'number'
    && value.length >= 0
    && value.length % 1 === 0
    && (!complex || typeof value.splice === 'function');
}