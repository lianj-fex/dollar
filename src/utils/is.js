const emptyObj = {};
export default function is(obj, type) {
  if (typeof type === 'function') return obj instanceof type;
  const result = emptyObj.toString.call(obj).slice(8, -1);
  if (type) return !!result.match(new RegExp(type, 'gi'));
  return result;
}
