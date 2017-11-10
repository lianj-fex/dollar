import $isEmptyObject from './utils/is-empty-object';
import $copy from './utils/copy';
import $forEach from './utils/for-each';
import $mix from './utils/mix';
import $toHash from './utils/to-collect';
import $serialize from './utils/serialize'
import $unserialize from './utils/unserialize';
import EventEmitter from './event-emitter';

const cookieSerializeOptions = {
  separator: ';',
  flatten: false
};
const cookieSerializeConfigOptions = {
  separator: ';',
  encode: false,
};

function isEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function isChange(result) {
  return !$isEmptyObject(result[0]) || !$isEmptyObject(result[1]);
}

function testAndSet(valueHash, isNew) {
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
        this.del(i);
      }
    }
  });
  return [newValue, oldValue, list];
}

const isBrowser = global.window;

export default class Cookie extends EventEmitter {
  static mixOptions = isBrowser ? {
    context: global,
    getCookies(options) {
      return $unserialize(this.options.context.document.cookie, cookieSerializeOptions);
    },
    setCookie(name, item, options) {
      if (options.expires instanceof Date) {
        options.expiresString = options.expiresString || options.expires.toGMTString();
      }
      this.options.context.document.cookie =
        `${
          $serialize({ [name]: item }, cookieSerializeOptions)
          }; ${
          $serialize({
            path: options.path,
            expires: options.expiresString,
            domain: options.domain
          }, cookieSerializeConfigOptions)
          }`;
    },
    removeCookies(keys) {
      keys = $toHash(keys, 'delete');

      this.options.context.document.cookie = $serialize(keys, cookieSerializeOptions) + '; ' + $serialize({
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
    this.config(options);
  }

  get(key) {
    // 先备份一下，以免被误改
    const list = this.options.getCookies.call(this, this.options);
    if (key) {
      return list[key];
    }
    return list;
  }

  set(hash, value, options) {
    let key;
    let isNew = true;
    // eslint-disable-next-line
    options = options || {
        path: '/'
      };
    if (typeof hash === 'string') {
      key = hash;
      // eslint-disable-next-line
      hash = {};
      hash[key] = value;
      isNew = value === undefined || value === null;
    }
    if ('expires' in hash) {
      options.expires = hash.expires;
      delete hash.expires;
    }
    if ('path' in hash) {
      options.path = hash.path;
      delete hash.path;
    }
    if ('domain' in hash) {
      options.domain = hash.domain;
      delete hash.domain;
    }
    if ('timeout' in hash) {
      options.timeout = hash.timeout;
      delete hash.timeout;
    }
    if (options.expires === undefined && options.timeout !== undefined) {
      options.expires = new Date(Date.now() + options.timeout);
    }
    const result = testAndSet.call(this, hash, isNew);
    if (isChange(result)) {
      // 延迟渲染，以免阻塞
      $forEach(result[0], (item, name) => {
        this.options.setCookie.call(this, name, item, options);
      });
    }
  }

  remove(keys) {
    if (typeof keys === 'string') {
      keys = [keys];
    }
    this.options.removeCookies.call(this, keys);
  }

}