import $reflect from './reflect';
import $int from './int';
import $isQueryElement from './is-query-element';
import $isArrayLike from './is-array-like';
import $is from './is';
import $isPlainObject from './is-plain-object';
/*
 {
 // 是否进行深度递归
 deep: true,
 // 在上一个条件为true的情况下，数组本身是否进入递归
 arrDeep: false,
 // 映射深度的key
 reflect: true,
 // 映射深度key的情况，是否对数组进行concat
 concatArrWhenReflect: true,
 // 在映射的情况下，是否创建对象或数组
 create: true,
 // 传递element时，进行clone
 cloneElement: false,
 // 忽略那些字段
 ignore: ['$$hashKey'],
 // 当source存在undefined时，清除target的对应字段
 clearWhenUndefined: true
 }
 */
/**
 *
 * @param target
 * @param source
 * @param options
 * @returns {*|{}}
 */
function $assign(target, source, options) {
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
  const assign = options.assign || ((obj, key, value) => { obj[key] = value });
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
        } else if (!options.ignoreExist || (own(obj, key) && options.ignoreExist)) {
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
              assign(obj, key, new Date(value.valueOf()));
            } else if ($is(value, 'regexp')) {
              assign(obj, key, new RegExp(value));
            } else if (value.nodeName) {
              assign(obj, key, cloneElement ? value.cloneNode(true) : value);
            } else if ($isQueryElement(value)) {
              assign(obj, key, cloneElement ? value.clone() : value);
            } else if ($isArrayLike(value)) {
              assign(obj, key, arrDeep ? $assign.call(this, [], [obj[key], value]) : value);
            } else {
              assign(obj, key, $isPlainObject(obj[key]) ?
                $assign.call(this, {}, [obj[key], value], options) :
                $assign.call(this, {}, [value], options)
              );
            }
          } else if (value !== undefined) {
            assign(obj, key, value);
          }
        }
      });
    }
  });
  return target;
}
export default $assign