export default function(func, wait) {
  let context;
  let args;
  let timeout;
  let result;
  let previous = 0;
  function later() {
    previous = new Date;
    timeout = null;
    result = func.apply(context, args);
  }
  return function (...a) {
    const now = new Date;
    const remaining = wait - (now - previous);
    context = this;
    args = a;
    if (remaining <= 0) {
      clearTimeout(timeout);
      timeout = null;
      previous = now;
      result = func.apply(context, args);
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};