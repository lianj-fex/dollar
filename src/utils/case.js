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
 * @param string
 * @param upper
 * @returns {string}
 */
export function camelCase(string, upper) {
  const result = string.replace(rmsPrefix, 'ms-').replace(rdashAlpha, fcamelCase);
  return upper ? name.charAt(0).toUpperCase() + result.substr(1) : result;
}

/**
 * 将字符串转换为大驼峰形式
 * @param string
 * @returns {string}
 */

export function upperCamelCase(string) {
  return camelCase(string, true);
}

/**
 * 将字符串转换为横杠联结形式
 * @param string
 * @returns {string}
 */
export function hyphen(string) {
  return string.replace(rhyphen, fhyphen);
}

/**
 * 将字符串转换为下划线联结形式
 * @param string
 * @returns {string}
 */
export function underscore(string) {
  return string.replace(rhyphen, funderscore);
}