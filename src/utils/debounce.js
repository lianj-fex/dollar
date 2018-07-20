/**
 * 函数去抖，输入一个函数func，并返回另一个函数，该返回的函数仅会在停止调用它后相隔wait时间段后才会执行func函数并返回结果，否则返回上一次调用func的结果
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