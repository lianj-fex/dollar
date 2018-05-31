import $isEmptyObject from './utils/is-empty-object';
import $copy from './utils/copy';
import $forEach from './utils/for-each';
import $mix from './utils/mix';
import $toHash from './utils/to-collect';
import $serialize from './utils/serialize'
import $unserialize from './utils/unserialize';
import EventEmitter from './event-emitter';

const cookieSerializeOptions = {
  includeUndefined: false,
  separator: ';',
  flatten: false
};
const cookieSerializeConfigOptions = {
  includeUndefined: false,
  separator: ';',
  encode: false,
};

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isChange(result) {
  return !$isEmptyObject(result[0]) || !$isEmptyObject(result[1]);
}

function testAndSet(valueHash, isNew, options) {
  let mix;
  const list = this.options.getCookies.call(this);
  const newValue = {};
  const oldValue = {};
  if (isNew) mix = $mix({}, valueHash, list);
  else mix = valueHash;
  $forEach(mix, (_, i) => {
    if (!isEqual(list[i], valueHash[i])) {
      // 如果不相等则赋值
      oldValue[i] = list[i];
      if (valueHash.hasOwnProperty(i)) list[i] = newValue[i] = $copy(valueHash[i]);
      else if (isNew) {
        this.remove(i, options);
      }
    }
  });
  return [newValue, oldValue, list];
}

const isBrowser = global.window;

/**
 * 读写cookie的类
 * @example
 * // --- 浏览器调用 ---
 * const cookie = new Cookie({ context: { document: window.document } })
 * // 获取所有cookie
 * cookie.get()
 *
 * // --- 服务端调用 ---
 * // request 和 response 均以express为例
 * const cookie = new Cookie({ context: {request, response} })
 * // 获取所有cookie
 * cookie.get()
 */
export default class Cookie extends EventEmitter {
  /**
   * @ignore
   */
  static mixOptions = isBrowser ? {
    context: global,
    getCookies() {
      return $unserialize(this.options.context.document.cookie, cookieSerializeOptions);
    },
    setCookie(name, item, options) {
      this.options.context.document.cookie =
        `${
          $serialize({ [name]: item }, cookieSerializeOptions)
          }; ${
          $serialize({
            path: options.path,
            expires: options.expires,
            domain: options.domain
          }, cookieSerializeConfigOptions)
          }`;
    },
    removeCookies(keys, options) {
      keys = $toHash(keys, 'delete');

      this.options.context.document.cookie = $serialize(keys, cookieSerializeOptions) + '; ' + $serialize({
          domain: options.domain,
          path: options.path,
          expires: (new Date(new Date() - 1)).toUTCString()
        }, cookieSerializeConfigOptions);
    }
  } : {
    /*
    context: {
      request,
      response
    },
    */
    getCookies() {
      return $unserialize(this.options.context.request.headers.cookie, cookieSerializeOptions);
    },
    setCookie(name, item, options) {
      this.options.context.response.cookie(name, item, options);
    },
    removeCookies(key){
      key.forEach((name) => {
        this.options.context.response.cookie(name, '', {
          expires: (new Date(new Date() - 1))
        });
      });
    }
  }

  constructor(options) {
    super(options);
  }

  /**
   * 获取cookie
   * @param {string} [key] cookie的键 也可以为空，为空时，获取整个cookie
   * @returns {*}
   */
  get(key) {
    // 先备份一下，以免被误改
    const list = this.options.getCookies.call(this, this.options);
    if (key) {
      return list[key];
    }
    return list;
  }
  /**
   * 设置cookie
   * @param {string} [key] cookie的键，可选，当key不传递时，value则为键值对应的对象
   * @param {string} value cookie的值
   * @param {object} [options] 设置cookie的options
   * @param {Date|string|number} [options.expires] cookie的超时时间<br>
   *   number 的情况，则会从当前时间计算超时时间<br>
   *   date 类型，则会转换为UTCString
   * @param {string} [options.path] cookie的作用路径
   * @param {string} [options.domain] cookie的作用域名
   * @returns {*}
   * @example
   *  // 设置cookie，30秒后超时
   *  cookie.set('my-cookie', 1, { expires: 30000 });
   *  // 也可以批量设置
   *  cookie.set({
   *    'my-cookie1': 1,
   *    'my-cookie2': 2
   *  }, { expires: 30000 })
   */
  set(key, value, options) {
    let hash;
    let isNew;
    if (typeof key === 'string') {
      hash = {};
      hash[key] = value;
    } else {
      options = value;
      hash = key;
      isNew = true
    }
    // eslint-disable-next-line
    options = $mix({
      path: '/'
    }, options);
    if (typeof options.expires === 'number') {
      options.expires = new Date(Date.now() + options.expires);
    }
    if (options.expires instanceof Date) {
      options.expires = options.expires.toGMTString();
    }
    const result = testAndSet.call(this, hash, isNew, options);
    if (isChange(result)) {
      $forEach(result[0], (item, name) => {
        this.options.setCookie.call(this, name, item, options);
      });
    }
  }

  /**
   * 清除cookie
   * @param {string|string[]} keys 需要清除的cookie，可以是字符串的数组
   * @returns {*}
   * @example
   *  cookie.remove(['my-cookie1', 'my-cookie2'])
   */
  remove(keys, options) {
    if (typeof keys === 'string') {
      keys = [keys];
    }
    this.options.removeCookies.call(this, keys, options);
  }

}