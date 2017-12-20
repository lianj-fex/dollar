export default function (func, wait, immediate) {
  let timeout;
  let result;
  return function (...args) {
    const context = this;
    function later() {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
    }
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) result = func.apply(context, args);
    return result;
  };
}