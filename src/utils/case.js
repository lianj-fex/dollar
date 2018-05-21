const rmsPrefix = /^-ms-/;
const rdashAlpha = /-([\da-z])/gi;
function fcamelCase(_, letter) {
  return letter.toUpperCase();
}
const rhyphen = /[^a-z0-9]?([A-Z0-9])/g;
function freplace(m, w, s) {
  return s + w.toLowerCase();
}
function fhyphen(m, w) {
  return freplace(m, w, '-');
}
function funderscore(m, w) {
  return freplace(m, w, '_');
}

/**
 * 将字符串转换为驼峰形式
 * @param {string} string 输入的字符串
 * @param {boolean} upper 是否首字母大写
 * @returns {string} 输出的字符串
 */
export function camelCase(string, upper) {
  const result = string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
  if (upper === undefined) {
    return result;
  } else {
    return result.charAt(0)[upper ? 'toUpperCase' : 'toLowerCase']() + result.substr(1)
  }
}

/**
 * 将字符串转换为大驼峰形式
 * @param {string} string 输入的字符串
 * @returns {string} 输出的字符串
 */

export function upperCamelCase(string) {
  return camelCase(string, true);
}

/**
 * 将字符串转换为横杠联结形式
 * @param {string} string 输入的字符串
 * @returns {string} 输出的字符串
 */
export function hyphen(string) {
  return string.replace(rhyphen, fhyphen);
}

/**
 * 将字符串转换为下划线联结形式
 * @param {string} string 输入的字符串
 * @returns {string} 输出的字符串
 */
export function underscore(string) {
  return string.replace(rhyphen, funderscore);
}