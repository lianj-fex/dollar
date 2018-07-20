export default function resolve(s, ...args) {
  if (typeof s === 'function') {
    return new Promise((resolve, reject) => { s(resolve, reject, ...args) });
  } else {
    return Promise.resolve(s);
  }
}