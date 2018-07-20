/**
 * 返回一个promise对象，在特定时间后被解决
 * @param {Date|number} t 当t为number时，则延时该时间后，promise会被解决，如果t为date，则该时候被解决
 * @param {*} result promise的结果
 * @returns {Promise}
 */
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