const emptyObj = {};
export default function hasOwn(obj, key) {
  return emptyObj.hasOwnProperty.call(obj, key);
}