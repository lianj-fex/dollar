import $each from './utils/each'
import $reflectVal from './utils/reflect-val'
import $extend from './utils/extend'
import $mix from './utils/mix'
import $serialize from './utils/serialize';
import $unserialize from './utils/unserialize';
import $isPlainObject from './utils/is-plain-object';
/*import $retry from './utils/retry';
 import $cacheable from './utils/cacheable';*/

import EventEmitter from './event-emitter';

const methods = ['get', 'post', 'delete', 'put'];
const type2Mime = {
  json: 'application/json',
  document: 'text/xml',
  text: 'text/plain'
}
/*
 const defaultMap = new Map();
 */

function isFormData(data) {
  return FormData.prototype.isPrototypeOf(data);
}
function isBlob(s) {
  return Blob.prototype.isPrototypeOf(s);
}
function xmlParse(txt) {
  if (window.DOMParser) {
    return (new DOMParser()).parseFromString(txt, "text/xml");
  } else {
    const xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
    xmlDoc.async = false;
    return xmlDoc.loadXML(txt);
  }
}
const rUrlEncoded = /[^=&]+=([^=&]+)?/
function isJSON(string) {
  return string.startsWith('[') && string.endsWith(']') || string.startsWith('{') && string.endsWith('}')
}
function isUrlEncoded(string) {
  return rUrlEncoded.test(string)
}
class Request extends EventEmitter {
  static object2FormData(obj) {
    const fd = new FormData();
    if (obj) {
      Object.keys(obj).forEach((key) => {
        fd.append(key, obj[key]);
      });
    }
    return fd;
  }
  static mixOptions = {
    // 超时时间
    timeout: 10000,
    // 是否同步请求
    sync: false,
    // 请求地址
    // 可以是function，则会在prepare时调用url(params)
    // const Path = require('path-parser')
    // const request = new Request((new Path('/users/profile/:id<\d+>')).build);
    // request.send({params: {id: 1}});
    // request.send({params: {id: 2}});
    url: '',
    params: {},
    // 请求头，默认为对象，会插入到请求头
    // 可以是function，则先运行，再按上述执行
    headers(options) {
      return {};
    },
    // 请求体，可以是字符串，会通过serial进行序列化
    body: {},
    query: {},
    /*
     // 缓存配置，请参考$cacheable
     cache: true,
     // 重试函数，请参考$retry
     retry: 3,
     // http认证的用户名跟账号
     */
    username: '',
    password: '',
    withCredentials: false,
    // 调用send方法的默认method
    method: 'get',
    // 用来设置响应的类型
    type: 'json',
    // 输出方法，返回转换的结果作为Promise的结果
    // function，传入xhr，返回转换后的xhr对象，或者类xhr对象,
    // 字符串，通过reflect反射出结果，默认返回xhr.response.data
    output: 'response.data',
    error(xhr, type) {
      if (xhr.status == 0) return new Error({timeout: '请求超时', error: '网络异常'}[type]);
      else {
        const error = new Error(xhr.response.message);
        error.code = xhr.response.code;
        return error;
      }
    }
  }
  constructor(method, ...args) {
    super();
    let urlOptions = {}
    const url = args[0];
    if (typeof url === 'string' || typeof url === 'function') {
      urlOptions = {
        url
      };
      args.shift();
    }
    this.config(this.getConfig(method, ...args), urlOptions);
    methods.forEach((method) => {
      this[method] = (...args) => this.send(method, ...args);
    });
  }

  then(...args) {
    return Promise.resolve(this.prepare(this.options)).then((sendOptions) => {
      return this.transport(sendOptions);
    }).then(...args)
  }
  async send(...args) {
    return this.transport(await this.prepare(args.length ? this.getConfig(...args) : {}))
  }
  async transport(options) {

    if (global.location && !options.url) {
      options.url = global.location.pathname;
      options.query = $mix($unserialize(global.location.search.replace('?', '')), options.query);
    }
    if (typeof options.url === 'function') {
      options.url = options.url(options.params);
    }
    options.queryString = $serialize(options.query);
    if (typeof options.headers === 'function') {
      options.headers = options.headers(options);
    }

    if (typeof options.output === 'string') {
      const outputStr = options.output
      options.output = (xhr) => $reflectVal(xhr, outputStr)
    }


    // 创建xhr对象
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.xhr = xhr;
      const url = options.url + (options.queryString ? (
          (options.url.includes('?') ? '&' : '?') + options.queryString) : ''
        );
      if (options.type) {
        try {
          xhr.responseType = options.type;
          if (xhr.overrideMimeType && type2Mime[options.type]) {
            xhr.overrideMimeType(type2Mime[options.type])
          }
        } catch(e) {}
      }
      xhr.onload = () => {

        const isNeedPolyFillJSON = options.type == 'json' && !xhr.responseType && !xhr.responseJSON && isJSON(xhr.responseText)
        let resultXhr = xhr;
        if (isNeedPolyFillJSON) {
          const json = JSON.parse(resultXhr.responseText);
          resultXhr = {
            status: resultXhr.status,
            response: json,
            responseJSON: json,
            responseType: 'json',
            getResponseHeader(...args) {
              return xhr.getResponseHeader(...args)
            }
          }
        }
        resultXhr = this.convert(resultXhr);

        const state = this.state(resultXhr);
        if (state === 'resolve') {
          const output = options.output ? options.output(resultXhr) : resultXhr;
          this.trigger('success', output);
          resolve(output)
        } else {
          const error = options.error(resultXhr);
          this.trigger('fail', error);
          reject(error)
        }
      };
      xhr.ontimeout = (...args) => {
        const error = options.error(xhr, 'timeout');
        this.trigger('fail', error);
        reject(error)
      }
      xhr.onerror = (e) => {
        const error = options.error(xhr, 'error');
        this.trigger('fail', error);
        reject(error)
      }
      xhr.upload.onprogress = (e) => {
        this.trigger('upload', [xhr, e.loaded, e.total]);
      };
      xhr.onprogress = () => {
        this.trigger('download', xhr)
      }

      if (options.withCredentials) {
        xhr.withCredentials = true;
      }


      const openParams = [options.method.toUpperCase(), url, !options.sync];
      if (options.username) {
        openParams.push(options.username, options.password)
      }
      xhr.open(...openParams);
      if (!options.sync && options.timeout) {
        xhr.timeout = options.timeout;
      }

      let body = options.body;
      const isFD = isFormData(body);
      if (typeof body !== 'string' && !isBlob(body) && !isFD) {
        body = this.serialize(options.body);
      }

      if (!isFD) {
        $each(options.headers, (key, value) => {
          xhr.setRequestHeader(key, value);
        });
      }

      if (typeof body === 'string' && body) {
        if (isJSON(body)) {
          xhr.setRequestHeader('Content-type', 'application/json');
        } else if (isUrlEncoded(body)) {
          xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        } else {
          xhr.setRequestHeader('Content-type', 'text/plain')
        }
      }
      try {
        xhr.send(body);
      } catch(e) {
        reject(e)
      }
    })
  }

  abort() {
    this.xhr.abort();
  }

  getConfig(method, sendData, output) {
    if (typeof method !== 'string') {
      output = sendData;
      sendData = method;
      method = undefined;
    }

    let tmpOptions;

    let methodAndOutput = {};
    if (method) {
      methodAndOutput.method = method
    }
    if (output) {
      methodAndOutput.output = output
    }
    if ($isPlainObject(sendData) && (sendData.method || sendData.url || sendData.query || sendData.body)) {
      tmpOptions = $extend({}, sendData, methodAndOutput)
    } else {
      tmpOptions = $extend({
        [method.toLowerCase() === 'get' ? 'query' : 'body']: sendData,
        sendData,
      }, methodAndOutput)
    }

    return tmpOptions;
  }

  // 发送前options的处理方法
  async prepare(options) {
    options = Object.assign({}, this.options, options)
    return options;

  }
  // 对于不支持的类型的序列化方法，
  serialize(s) {
    if (typeof s === 'undefined') return '';
    if (typeof s === 'object') {
      if (!Array.isArray(s) && !Object.keys(s).length) {
        return '';
      } else {
        return JSON.stringify(s);
      }
    }
    return s;
  }
  // 转换方法，用于返回的xhr对象转换为正确的对象
  convert(r) { return r }

  // 判断状态, function 返回 'resolve', 'notify' 或者 'reject'
  // 0 为网络错误
  state(xhr) {
    if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304)
      return 'resolve';
    return 'reject';
  }

  static send(...args) {
    return new this(...args)
  }
}

methods.forEach((method) => {
  Request[method] = function(...args){
    return this.send(method, ...args)
  };
});

export default Request;
