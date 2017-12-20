export default function once(callback) {
  let isCalled = false;
  let ret;
  return function fn(...params) {
    if (!isCalled) {
      ret = callback.apply(this, params);
      isCalled = true;
    }
    return ret;
  };
};