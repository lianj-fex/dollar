import $isPlainObject from './is-plain-object';
import $extend from './extend';
import $is from './is';
import $delay from './delay';
const defaultCacheMapSymbol = Symbol();
const cacheIdSymbol = Symbol();
let id = 0;
export default function cacheable(fn, options) {
  if (!$isPlainObject(options)) {
    options = {
      expires: options,
    };
  }
  options = $extend({}, options, cacheable.defaults);
  if (options.key && !$is(options.key, 'function')) {
    const tmpKey = options.key;
    options.key = () => tmpKey;
  }
  if ($is(options.expires, 'number') || $is(options.expires, 'date')) {
    const tmpExpires = options.expires;
    options.expires = async (result) => { await result.catch(() => {}); await $delay(tmpExpires); };
  }
  return function fnResult(...args) {
    const context = options.context || this;
    fn[cacheIdSymbol] = fn[cacheIdSymbol] || id++;
    context[cacheIdSymbol] = context[cacheIdSymbol] || id++;
    const cacheKey = options.key ? options.key.call(context, ...args) : `${fn[cacheIdSymbol]}-${context[cacheIdSymbol]}`;
    const map = $is(options.map, 'function') ? options.map.call(context) : options.map;

    let cacheItem = options.get.call(context, cacheKey, map);
    if (cacheItem) {
      const obstruction = typeof options.obstruction === 'function' ? options.obstruction.call(context, ...args) : options.obstruction;
      if (obstruction) {
        throw obstruction;
      }
    } else {
      cacheItem = fn.call(this, ...args);
      options.set.call(context, cacheKey, cacheItem, map);
      options.expires.call(context, cacheItem).then(() => {
        options.clear.call(context, cacheKey, map);
      });
    }
    return cacheItem;
  }
}
cacheable.defaults = {
  // 调用config各种方法的上下文，如果为undefined，则为结果function的上下文
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
  // 设置缓存的key，如果为undefined，则自动生成
  key: undefined,
  /*
  key() {
    return this;
  },
  */
  // 缓存表或者获取缓存表的方法;
  map() {
    return this[defaultCacheMapSymbol] = this[defaultCacheMapSymbol] || new Map();
  },
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