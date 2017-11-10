import $isPlainObject from './is-plain-object';
import $extend from './extend';
import $is from './is';
import $delay from './delay';
const defaultCacheMap = new Map();
export default function cacheable(fn, options) {
  if (!$isPlainObject(options)) {
    options = {
      key: options,
    };
  }
  options = $extend({}, options, cacheable.defaults);
  if (!$is(options.key, 'function')) {
    const tmpKey = options.key;
    options.key = () => tmpKey;
  }
  if ($is(options.expires, 'number') || $is(options.expires, 'date')) {
    const tmpExpires = options.expires;
    options.expires = async (result) => { await result; await $delay(tmpExpires); };
  }
  return function (...args) {
    const context = options.context || this;
    const cacheKey = options.key.call(context, ...args);
    let cacheItem = options.get.call(context, cacheKey, options.map);
    if (cacheItem) {
      const obstruction = typeof options.obstruction === 'function' ? options.obstruction.call(context, ...args) : options.obstruction;
      if (obstruction) {
        throw obstruction;
      }
    } else {
      cacheItem = fn.call(this, ...args);
      options.set.call(context, cacheKey, cacheItem, options.map);
      options.expires.call(context, cacheItem).then(() => {
        options.clear.call(context, cacheKey, options.map);
      });
    }
    return cacheItem;
  };
}
cacheable.defaults = {
  context: undefined,
  // 设置cache的过期时间或者方法
  // number，设置n毫秒后清除缓存
  // date，设置某个时间清除缓存
  // function 返回一个promise决定超时时机
  expires: result => result.catch(() => {}),
  // 如果缓存结果，则是否阻塞
  // false，不阻塞，将返回上一次的结果
  // object 阻塞，则抛出该对象
  // 或者 function 获取返回值后按照上述规则
  obstruction: false,
  // 设置缓存的key
  key() {
    return this;
  },
  // map参数和get等参数二选一
  map: defaultCacheMap,
  // 获取设置清除缓存的方法
  get(r, map) {
    return map.get(r);
  },
  set(k, r, map) {
    map.set(k, r);
  },
  // 超时时，决定如何清理缓存
  remove(r, map) {
    map.delete(r);
  }
}