export default function (t, result) {
  if (t === Infinity) {
    return new Promise(() => {});
  }
  if (t instanceof Date) {
    t = (+ t) - Date.now();
  }
  if (t <= 0) return Promise.resolve(result);
  return new Promise((r) => {
    setTimeout(() => { r(result) }, t);
  });
}