export default function (s) {
  if (typeof s === 'function') {
    return new Promise(s);
  } else {
    return Promise.resolve(s);
  }
}