import $isPlainObject from './is-plain-object';
import $extend from './extend';
import $is from './is';
import $delay from './delay';
import $relation from './relation'
const defaultCacheMapSymbol = Symbol();
const defaultExpiresMapSymbol = Symbol();
/**
 * 缓存一个函数的返回值，使得在缓存生效期间内，函数返回相同的结果或者重复运行进行报错
 * @param {function} fn 需要缓存的函数
 * @param {object} options 缓存的参数
 * @param {object|function} options.context 调用options各种方法的上下文，如果为undefined，则为结果function的上下文
 * @param {object|function} options.expires 设置cache的过期时间或者方法<br>
 *     number 设置n毫秒后清除缓存<br>
 *     date 设置某个时间清除缓存<br>
 *     function 返回一个promise决定超时时机
 * @param {boolean} options.abortExpires 是否在再次调用的时候更新生成expires，并跳过之前的expires<br>
 * @param {object|function} options.obstruction 如果缓存结果，则是否阻塞<br>
 *     false 不阻塞，将返回上一次的结果<br>
 *     object 阻塞，则抛出该对象<br>
 *     function 获取返回值后按照上述规则
 * @param {string|function} options.key 设置缓存的key，如果为undefined，则通过relation函数自动生成
 * @param {*} options.map 缓存表或者获取缓存表的方法，如果是function则会被调用，如果为undefined，则会自动生成
 * @param {function()} options.set 写入缓存的方法，如果为undefined，则配合默认的options.map使用
 * @param {function} options.get 获取缓存的方法，如果为undefined，则配合默认的options.map使用
 * @param {function} options.remove 清除缓存的方法，如果为undefined，则配合默认的options.map使用
 * @returns {function} 返回一个新的函数
 */
export default function cacheable(fn, options) {
  if (!$isPlainObject(options)) {
    options = {
      expires: options,
    };
  }
  options = $extend({}, cacheable.defaults, options);
  if (options.key && !$is(options.key, 'function')) {
    const tmpKey = options.key;
    options.key = () => tmpKey;
  }
  if ($is(options.expires, 'number') || $is(options.expires, 'date')) {
    const tmpExpires = options.expires;
    options.expires = async (result) => { await result.catch(() => {}); await $delay(tmpExpires); };
  }
  return function fnResult(...args) {
    const context = options.context || (this === null || this === undefined) ? options : this;
    const cacheContext = options.cacheContext || context
    const cacheKey = $is(options.key, 'function') ? options.key.call(cacheContext, fn, ...args) : options.key;
    const map = $is(options.map, 'function') ? options.map.call(cacheContext) : options.map;
    cacheContext[defaultExpiresMapSymbol] = cacheContext[defaultExpiresMapSymbol] || new Map();
    let cacheExpires = cacheContext[defaultExpiresMapSymbol].get(cacheKey);
    let cacheItem = options.get.call(cacheContext, cacheKey, map);
    if (options.abortExpires && cacheExpires) {
      cacheExpires.isAbort = true;
      cacheExpires = undefined;
    }
    if (cacheItem) {
      const obstruction = typeof options.obstruction === 'function' ? options.obstruction.call(context, ...args) : options.obstruction;
      if (obstruction) {
        throw obstruction;
      }
    } else {
      cacheItem = fn.call(this, ...args);
      options.set.call(cacheContext, cacheKey, cacheItem, map);
    }
    if (!cacheExpires) {
      cacheExpires = options.expires.call(cacheContext, cacheItem);
      cacheExpires.then(() => {
        if (!cacheExpires.isAbort) {
          options.remove.call(cacheContext, cacheKey, map, cacheItem);
          cacheContext[defaultExpiresMapSymbol].delete(cacheKey);
        }
      });
      cacheContext[defaultExpiresMapSymbol].set(cacheKey, cacheExpires);
    }
    return cacheItem;
  }
}
cacheable.defaults = {
  context: undefined,
  // cacheContext: undefined,
  expires: result => result.catch(() => {}),
  abortExpires: false,
  obstruction: false,
  key(fn) {
    return $relation(this, fn)
  },
  map() {
    return this[defaultCacheMapSymbol] = this[defaultCacheMapSymbol] || new Map();
  },
  // 获取设置清除缓存的方法
  get(k, map) {
    k = $isPlainObject(k) ? JSON.stringify(k) : k
    return map.get(k);
  },
  set(k, r, map) {
    k = $isPlainObject(k) ? JSON.stringify(k) : k
    map.set(k, r);
  },
  // 超时时，决定如何清理缓存
  remove(r, map) {
    map.delete(r);
  }
}