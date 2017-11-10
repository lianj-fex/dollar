const emptyObj = {};
export default function (obj, key) {
  return emptyObj.hasOwnProperty.call(obj, key);
}