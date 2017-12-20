import $forEach from './for-each';
import $setGroup from './set-group';
import $extend from './extend';
import $mix from './mix';
const r = /[\n\r\s]/g;

function assume(value) {
  try {
    value = decodeURIComponent(value);
  } catch (e) {}
  if (value.indexOf('{') === 0 || value.indexOf('[') === 0) {
    // 预测是对象或者数组
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  } else if (value === '') {
    // 为空
    return null;
    /*
     } else if (!isNaN(Number(value).valueOf())) {
     //数字
     return Number(value).valueOf();
     */
  } else if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    return value;
  }
}

/**
 * 反序列化，通过字符串来生成对象
 * @method armer.unserialize
 * @static
 * @param {String} str
 * @param [options] {{ separator, assignment, splitter }}
 * {String} [separator] 分割符，默认【&】
 * {String} [assignment] 赋值符，默认【=】
 * {String} [splitter] 分隔符，默认【,】
 * @returns {Object|Array}
 */
function unserialize(str, options) {
  if (str === '' || str === undefined || str === null) return {};
  options = $extend({}, unserialize.defaults, options);
  const { separator, assignment, splitter } = options;
  str = str.replace(r, '');
  const group = str.split(separator);
  const result = {};
  $forEach(group, (str) => {
    const splits = str.split(assignment);
    let key = splits[0];
    const value = splits[1];
    const m = key.match(/(.*)\[]$/);

    if (m) {
      key = m[1];
      result[key] = result[key] || [];
    }

    if (!value) {
      return undefined;
    } else {
      const s = decodeURIComponent(value);
      key = decodeURIComponent(key);
      if (value.indexOf(splitter) > -1 && s.indexOf('[') !== 0 && s.indexOf('{') !== 0) {
        result[key] = result[key] || [];
        $forEach(value.split(splitter), (value) => {
          $setGroup(result, key, assume(value));
        });
      } else {
        $setGroup(result, key, assume(value));
      }
    }
  });
  return $mix({}, result);
}
unserialize.defaults = {
  separator: '&',
  assignment: '=',
  splitter: ','
};
export default unserialize