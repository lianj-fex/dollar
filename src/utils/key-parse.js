const separator = /]\[|]\.|]|\[|\./;
export default function (str) {
  const arr = str.split(separator);
  if (arr[arr.length - 1] === '') arr.splice(arr.length - 1, 1);
  return arr;
}