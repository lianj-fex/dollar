import $isArray from './is-array';
import $isArrayLike from './is-array-like';
import $isPlainObject from './is-plain-object';
import $extend from './extend';
import $flatten from './flatten';
import $forEach from './for-each';


// 猜测值返回不同结果
function assume(i, value, assignment, add) {
  const isArr = $isArray(value);
  const isObject = typeof value === 'object';
  if (isObject && !isArr && !$isPlainObject) {
    console.warn('Object %o can\'t be serialize', value);
  } else if (isArr) {
    value.forEach((item) => {
      assume(i, item, assignment, add);
    });
  } else if (isObject) {
    add(i, JSON.stringify(value), assignment);
  } else if (value !== undefined) {
    add(i, value === null ? '' : value, assignment);
  }
}

/**
 * 序列化，通过对象或数组产生类似cookie、get等字符串
 * @method armer.serialize
 * @static
 * @param {Object|Array.Object} obj
 * @param [options] {{separator, assignment, join, encode}} 序列化的参数
 * {string} [separator] 分割符，默认【&】
 * {string} [assignment] 赋值符，默认【=】
 * {string|function} [join] 数组类型的合并符，默认【,】，或者是合并方法
 * {boolean} [encode] 是否进行编码, 默认true
 * @returns {Object}
 */
function serialize(obj, options) {
  options = $extend({}, serialize.defaults, options);
  const { separator, assignment } = options;
  let { join, flatten, encode } = options;
  if (typeof join === 'string') {
    const arrSeparator = join;
    join = (a) => {
      if (typeof a[0] === 'object') {
        return a;
      } else {
        return a.join(arrSeparator);
      }
    };
  }
  if (flatten === true) {
    flatten = (obj) => $flatten(obj, true, true, false, true);
  }
  if (flatten === false && join) {
    flatten = (obj) => {
      const resource = $extend({}, obj);
      if (typeof join === 'function') {
        $forEach(resource, (item, i) => {
          if ($isArray(item)) resource[i] = join(item);
        });
      }
      return resource;
    };
  }
  encode = encode === true ? encodeURIComponent : (val) => val;
  const s = [];
  function add(key, value, assignment) {
    s.push(encode(key) + assignment + encode(value));
  }
  if (typeof obj === 'string' && obj === '' || obj == null) return '';
  else if ($isArrayLike(obj)) {
    return serialize.call(this, $.serializeNodes(obj, join), separator, assignment, join, encode);
  } else if (typeof obj === 'object') {
    $forEach(flatten ? flatten(obj) : obj, (value, i) => {
      assume(i, value, assignment, add);
    });
  } else {
    throw new TypeError;
  }
  return s.join(separator);
}

serialize.defaults = {
  separator: '&',
  assignment: '=',
  join: ',',
  encode: true,
  flatten: true
};

export default serialize;
