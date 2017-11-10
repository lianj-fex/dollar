export default function (obj) {
  let name;
  for (name in obj) {
    return false;
  }
  return true;
}