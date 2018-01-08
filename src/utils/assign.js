import $reflect from './reflect';
import $int from './int';
import $isQueryElement from './is-query-element';
import $isArrayLike from './is-array-like';
import $is from './is';
import $isPlainObject from './is-plain-object';
import $own from './own'
/**
 * 合并多个对象
 * 这个是defaults和mix，和extend函数的基础函数，一般情况请使用上述函数而不是这个函数
 * @param {object} target 需要被合并的目标对象
 * @param {object[]} source 需要合并的数据源
 * @param {object} options 合并的参数
 * @param {boolean} options.deep 是否进行深度递归
 * @param {boolean} options.arrDeep 在上一个条件为true的情况下，数组本身是否进入递归
 * @param {boolean} options.reflect 是否映射深度的key，当数据源的key为'a.b'时，目标的a.b将会进行处理
 * @param {boolean} options.create 在映射的情况下，是否创建对象或数组，当数据源的key为'a.b'时，如果目标的a属性不存在，则创造a对象，再处理a.b
 * @param {boolean} options.concatArrWhenReflect 在映射的情况下，数组是否进行合并
 * @param {boolean} options.cloneElement 传递element时，进行clone操作
 * @param {string[]} options.ignore 忽略那些字段
 * @param {boolean} options.ignoreExist 忽略target中存在的字段
 * @param {boolean} options.clearWhenUndefined 当source存在undefined时，清除target的对应字段
 * @example
 *  assign({a: {b: 2}}, {'a.b': 1}, {reflect: true})
 *  // { a: {b: 1} }
 * @returns {object} 返回合并之后的对象
 */
export default function assign(target, source, options) {
  if (Array.isArray(target)) {
    options = source;
    source = target;
    target = this;
  }
  options = options || {};
  target = target || {};
  const { create, deep, arrDeep, concatArrWhenReflect, cloneElement } = options;
  const reflect = options.reflect;
  const clearWhenUndefined =
    options.clearWhenUndefined === undefined ? true : options.clearWhenUndefined;
  const ignore = options.ignore || [];
  const ignoreExist = options.ignoreExist || false;
  const optionAssign = options.assign || ((obj, key, value) => { obj[key] = value });
  for (let i = 0; i < source.length;) {
    if (typeof source[i] === 'string') {
      source[i] = { [source[i]]: source.splice(i + 1, 1)[0] };
    } else {
      i++;
    }
  }
  source.forEach((item) => {
    if (target !== item && item !== null && item !== undefined) {
      Object.keys(item).forEach((key) => {
        let value = item[key];
        let obj = target;

        if (/[[\].]/.test(key) && reflect) {
          const reflectVal = $reflect(target, key, create);
          obj = reflectVal[0];
          key = reflectVal[1];
        }

        if (ignore.indexOf(key) !== -1) return;
        if (value === undefined && clearWhenUndefined) {
          delete obj[key];
        } else if (!options.ignoreExist || ($own(obj, key) && options.ignoreExist)) {
          if ($isArrayLike(obj) && deep && reflect && concatArrWhenReflect) {
            key = $int(key);
            if (!$isArrayLike(value)) {
              value = [value];
            }
            // 当位数不足时，补足undefined
            while (key > obj.length) {
              obj.push(undefined);
            }
            [].splice.apply(obj, [key, 0].concat([].slice.call(value)))
          } else if (value && typeof value === 'object' && deep) {
            if ($is(value, 'date')) {
              optionAssign(obj, key, new Date(value.valueOf()));
            } else if ($is(value, 'regexp')) {
              optionAssign(obj, key, new RegExp(value));
            } else if (value.nodeName) {
              optionAssign(obj, key, cloneElement ? value.cloneNode(true) : value);
            } else if ($isQueryElement(value)) {
              optionAssign(obj, key, cloneElement ? value.clone() : value);
            } else if ($isArrayLike(value)) {
              optionAssign(obj, key, arrDeep ? assign.call(this, [], [obj[key], value]) : value);
            } else {
              optionAssign(obj, key, $isPlainObject(obj[key]) ?
                assign.call(this, {}, [obj[key], value], options) :
                assign.call(this, {}, [value], options)
              );
            }
          } else if (value !== undefined) {
            optionAssign(obj, key, value);
          }
        }
      });
    }
  });
  return target;
}