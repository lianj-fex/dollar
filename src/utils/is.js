const emptyObj = {};
export default function is(obj, type) {
  if (typeof type === 'function') return obj instanceof type;
  const result = emptyObj.toString.call(obj).slice(8, -1);
  if (type) {
    if (!(type instanceof RegExp)) {
      type = new RegExp(type, 'gi')
    }
    return type.test(result)
  }
  return result;
}
