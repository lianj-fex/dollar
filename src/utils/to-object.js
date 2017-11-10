const rword = /[^, |]+/g;
export default function(array, valFn, keyFn) {
  if (typeof array === 'string') {
    array = array.match(rword) || [];
  }
  const result = {};
  if (typeof valFn !== 'function') {
    const valStr = valFn;
    valFn = (val) => valStr ? valStr : val;
  }
  if (typeof keyFn !== 'function') {
    keyFn = (_, key) => key;
  }
  for (let i = 0, n = array.length; i < n; i++) {
    result[keyFn(array[i], i)] = valFn(array[i], i);
  }
  return result;
}