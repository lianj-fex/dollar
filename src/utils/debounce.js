/**
 * 函数去抖，当函数被调用时，等待若干毫秒后，在此期间，无论调用多少次，函数返回的结果，均等于最后一次调用的结果
 * @param {function} func 需要去抖的函数
 * @param {number} wait 等待的时间
 * @param {boolean} immediate 第一次调用的情况马上执行
 * @returns {function} 去抖后的函数
 */
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