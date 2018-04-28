import $isArray from './is-array';
import $isArrayLike from './is-array-like';
import $isPlainObject from './is-plain-object';
import $extend from './extend';
import $flatten from './flatten';
import $forEach from './for-each';


// 猜测值返回不同结果
function assume(i, value, add, nullValue, undefinedValue, deep) {
  deep = deep || 0;
  const isArr = $isArray(value);
  const isObject = typeof value === 'object';
  if (isObject && !isArr && !$isPlainObject) {
    console.warn('Object %o can\'t be serialize', value);
  } else if (isArr && deep === 0) {
    value.forEach((item) => {
      deep += 1
      assume(i, item, add, nullValue, deep);
    });
  } else if (value === undefined) {
    add(i, undefinedValue)
  } else if (value === null) {
    add(i, nullValue);
  } else if (isObject) {
    add(i, JSON.stringify(value));
  } else {
    add(i, value)
  }
}

/**
 * 序列化，通过对象或数组产生类似cookie、get等字符串
 * @param {Object|Array.Object} obj
 * @param {options} [options] 序列化的参数
 * @param {string} [options.separator] 分割符，默认【&】
 * @param {string} [options.assignment] 赋值符，默认【=】
 * @param {boolean|function} [options.flatten] 平坦化对象，默认true，与join参数二选一
 * @param {string|function} [options.join] 数组类型的合并符，默认【,】，或者是合并方法
 * @param {boolean|function} [options.sort] 排列参数的顺序默认undefined
 * @param {string} [options.nullValue] 当遇到null的情况如何处理，默认为【""】，当做字符串""
 * @param {string} [options.includeUndefined] 转换是否包括undefined，默认为true，如果为false，则undefined的键值都会被排除
 * @param {string} [options.undefinedValue] 当遇到undefined的情况如何处理，默认为【undefined】，会被处理为只有key的情况，例如 { a: 1, b: undefined }，会被转换为 a=1?b
 * @param {boolean} [options.encode] 是否进行编码, 默认true
 * @returns {string}
 */
function serialize(obj, options) {
  options = $extend({}, serialize.defaults, options);
  const { separator, assignment, nullValue, undefinedValue, includeUndefined } = options;
  let { join, flatten, encode, sort } = options;
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
  if (sort === true) {
    sort = (aKey, a, bKey, b) => aKey > bKey
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
  function add(key, value) {
    if (value === undefined) {
      if (includeUndefined) {
        s.push(encode(key))
      }
    } else {
      s.push(encode(key) + assignment + encode(value));
    }
  }
  if (typeof obj === 'string' && obj === '' || obj == null) return '';
  else if ($isArrayLike(obj)) {
    return serialize.call(this, $.serializeNodes(obj, join), separator, assignment, join, encode);
  } else if (typeof obj === 'object') {
    obj = flatten ? flatten(obj) : obj;
    if (sort) {
      Object.keys(obj).sort((aKey, bKey) => {
        return sort(aKey, obj[aKey], bKey, obj[bKey])
      }).forEach((key) => {
        assume(key, obj[key], add, nullValue, undefinedValue);
      })
    } else {
      $forEach(obj, (value, key) => {
        assume(key, value, add, nullValue, undefinedValue);
      });
    }
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
  flatten: true,
  includeUndefined: true,
  undefinedValue: undefined,
  nullValue: '',
  sort: true
};

export default serialize;
