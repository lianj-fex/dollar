export default function (t) {
  if (t === Infinity) {
    return new Promise(() => {});
  }
  if (t instanceof Date) {
    t = (+ t) - Date.now();
  }
  if (t <= 0) return Promise.resolve();
  return new Promise((r) => {
    setTimeout(r, t);
  });
}