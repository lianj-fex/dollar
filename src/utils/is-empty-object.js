export default function isEmptyObject(obj) {
  let name;
  for (name in obj) {
    return false;
  }
  return true;
}