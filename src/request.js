import $each from './utils/each'
import $reflectVal from './utils/reflect-val'
import $extend from './utils/extend'
import $mix from './utils/mix'
import $serialize from './utils/serialize';
import $unserialize from './utils/unserialize';
import $isPlainObject from './utils/is-plain-object';
/*import $retry from './utils/retry';
 import $cacheable from './utils/cacheable';*/
import XMLHttpRequest from 'xhr2';
import EventEmitter from './event-emitter';
const rUrlEncoded = /[^=&]+=([^=&]+)?/
const rXml = /<[a-zA-Z0-9-]+>/
const unknowType = 'application/octet-stream';
const methods = ['get', 'post', 'delete', 'put', 'patch'];
const type2Mime = {
  json: 'application/json',
  document: 'text/xml',
  text: 'text/plain'
}
let isSupportJSON;
let isSupportXmlInnerHtml;
/*
 const defaultMap = new Map();
 */
function isFormData(data) {
  return global.FormData && FormData.prototype.isPrototypeOf(data);
}
function isBlob(s) {
  return global.Blob && Blob.prototype.isPrototypeOf(s);
}
function isArrayBuffer(s) {
  return global.ArrayBuffer && (s instanceof ArrayBuffer)
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
function isJSON(string) {
  return string.startsWith('[') && string.endsWith(']') || string.startsWith('{') && string.endsWith('}')
}
function isUrlEncoded(string) {
  return rUrlEncoded.test(string)
}
function isXML(string) {
  return rXml.test(string)
}
function hasKeys(obj, keys) {
  return Object.keys(obj).some((key) => !!~keys.indexOf(key))
}

class RequestError extends Error {
  constructor(xhr) {
    super()
    this.xhr = xhr;
    this.stack = (new Error()).stack;
    this.name = this.constructor.name;
  }
  get message() {
    return (this.xhr.response ? this.xhr.response.message : undefined) || xhr.statusText
  }
  get status() {
    return this.xhr.status
  }
  get statusText() {
    return this.xhr.statusText
  }
}
function statusText2Code(str) {
  return str.match(/^\d+/)[0]
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
    // 请求超时时的错误码，参考Cloudflare的超时错误码
    timeoutStatus: '524 A Timeout Occurred',
    // 用户abort时错误码，参考ngnix
    abortStatus: '499 Client Closed Request',
    // 用户由于网络原因中断请求导致的错误
    networkErrorStatus: '444 No Response',
    // 超时时间
    timeout: 10000,
    // 是否产生thenable对象
    thenable: true,
    // 是否同步请求
    sync: false,
    // 请求地址
    // 可以是function，则会在prepare时调用url(params)
    // const Path = require('path-parser')
    // const request = new Request((new Path('/users/profile/:id<\d+>')).build);
    // request.send({params: {id: 1}});
    // request.send({params: {id: 2}});
    url({ base, path }) { return `${base ? base : ''}${path}`},
    params: {},
    // 请求头，默认为对象，会插入到请求头
    // 可以是function，则先运行，再按上述执行
    headers(options) {
      return {};
    },
    // 请求体，可以是字符串，会通过serial进行序列化
    // body: undefined,
    // query: undefined,
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
    output: 'response',
    // query的序列化方法
    prepare(options) {
      return Object.assign({}, this.options, options);
    },
    error(xhr, options) {
      return new RequestError(xhr)
    },
    queryStringify(query) {
      return $serialize(query)
    }
  }
  // 用于判断是options还是sendData
  isOptions(sendData) {
    // hasKeys(sendDataOrOptions, Object.keys(this.constructor.options))
    return $isPlainObject(sendData) && (typeof sendData.method === 'string' ||
      typeof sendData.url === 'function' || typeof sendData.url === 'string' ||
      typeof sendData.query === 'object' || sendData.body ||
      typeof sendData.output === 'string' || typeof sendData.output === 'function' ||
      typeof sendData.convert === 'function' ||
      typeof sendData.prepare === 'function' ||
      typeof sendData.headers === 'object' || typeof sendData.headers === 'function')
  }

  constructor(...args) {
    super(...args);
    if (isSupportJSON === undefined) {
      const xhr = new XMLHttpRequest()
      isSupportJSON = 'responseJSON' in xhr
    }
    methods.forEach((method) => {
      this[method] = (...args) => this.send(method, ...args);
    });
    if (this.options.thenable) {
      this.then = (...args) => {
        return this.send().then(...args)
      }
    }
  }

  async send(...args) {
    const options = args.length ? $extend({}, this.options, this.args2Options(...args)) : this.options;
    const sendOptions = await this.prepare(options);
    return await this.output(await this.transport(sendOptions), sendOptions)
  }
  async transport(options) {
    const isFD = isFormData(options.body);

    // 创建xhr对象
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      this.xhr = xhr;
      const url = options.url + (options.queryString ? (
          (options.url.includes('?') ? '&' : '?') + options.queryString) : ''
      );

      const openParams = [options.method, url, !options.sync];
      if (options.username) {
        openParams.push(options.username, options.password)
      }
      xhr.open(...openParams);



      $each(options.headers, (key, value) => {
        if ((!isFD || key !== 'Content-Type') && value !== undefined) {
          xhr.setRequestHeader(key, value);
        }
      });


      if (options.withCredentials) {
        xhr.withCredentials = true;
      }

      if (options.type === 'json' && isSupportJSON === false || options.type === 'document' && isSupportXmlInnerHtml === false) {
        xhr.responseType = 'text'
      }  else {
        xhr.responseType = options.type;
      }
      if (xhr.overrideMimeType && type2Mime[options.type]) {
        xhr.overrideMimeType(type2Mime[options.type])
      }

      if (!options.sync && options.timeout) {
        xhr.timeout = options.timeout;
      }

      const callback = (resultXhr) => {
        const state = this.state(resultXhr);
        if (state === 'resolve') {
          this.trigger('success', resultXhr);
          resolve(resultXhr)
        } else {
          const error = options.error(resultXhr, options);
          this.trigger('fail', [resultXhr, error]);
          reject(error)
        }
      }
      xhr.onload = () => {
        const isCheckPolyFillDocument = xhr.responseType === 'document' && xhr.response && xhr.response.getElementsByTagName('*')[0] ;
        if (isCheckPolyFillDocument && isSupportXmlInnerHtml === undefined) {
          isSupportXmlInnerHtml = !!xhr.response.getElementsByTagName('*')[0].innerHTML;
        }

        const isNeedPolyFillJSON = options.type === 'json' && isSupportJSON === false
        const isNeedPolyFillDocument = options.type === 'document' && !!xhr.response && !isSupportXmlInnerHtml

        let resultXhr = xhr;
        if (isNeedPolyFillJSON) {
          const json = JSON.parse(resultXhr.responseText);
          resultXhr = {
            status: resultXhr.status,
            statusText: resultXhr.statusText,
            response: json,
            responseJSON: json,
            responseType: 'json',
            getResponseHeader(...args) {
              return xhr.getResponseHeader(...args)
            }
          }
        }
        if (isNeedPolyFillDocument) {
          let responseText
          if (resultXhr.responseType === 'document') {
            const serializer = new XMLSerializer();
            responseText = serializer.serializeToString(resultXhr.responseXML).replace(/<([^ ]+)(.?)\/>/g, '<$1$2></$1>');
          } else {
            responseText = resultXhr.responseText;
          }
          const wrapper = document.createElement('xml');
          wrapper.innerHTML = responseText;
          const response = wrapper;
          resultXhr = {
            status: resultXhr.status,
            statusText: resultXhr.statusText,
            responseXML: response,
            response,
            responseType: 'document',
            getResponseHeader(...args) {
              return xhr.getResponseHeader(...args)
            }
          }
        }
        resultXhr = this.convert(resultXhr, options);
        resultXhr.originalXhr = xhr;
        callback(resultXhr);
      };
      xhr.ontimeout = (...args) => {
        callback({
          statusText: options.timeoutStatus,
          status: statusText2Code(options.timeoutStatus),
          response: null,
          originalXhr: xhr
        });
      }
      xhr.onabort = (e) => {
        const statusText = options.abortStatus
        callback({
          statusText,
          status: statusText2Code(statusText),
          response: null,
          originalXhr: xhr
        });
      }
      xhr.onerror = (e) => {
        const statusText = options.networkErrorStatus
        callback({
          statusText,
          status: statusText2Code(statusText),
          response: null,
          originalXhr: xhr
        });
      }
      xhr.upload.onprogress = (e) => {
        this.trigger('upload', [xhr, e.loaded, e.total]);
      };
      xhr.onprogress = () => {
        this.trigger('download', xhr)
      }
      xhr.send(options.body);
    })
  }

  abort() {
    this.xhr.abort();
  }

  args2Options(method, url, sendDataOrOptions, output) {
    let tmpOptions;

    if (typeof method !== 'string') {
      output = sendDataOrOptions;
      sendDataOrOptions = url;
      url = method;
      method = undefined;
    }

    if (typeof url !== 'function' && (typeof url !== 'string' || typeof url === 'string' && !~url.indexOf('/')) ) {
      output = sendDataOrOptions;
      sendDataOrOptions = url;
      url = undefined;
    }

    let methodAndOutputAndUrl = {};
    if (method) {
      methodAndOutputAndUrl.method = method
    }
    if (url) {
      if (typeof url === 'function') {
        methodAndOutputAndUrl.url = url;
      } else {
        methodAndOutputAndUrl.params = {
          path: url
        }
      }
    }
    if (output) {
      methodAndOutputAndUrl.output = output
    }
    if (this.isOptions(sendDataOrOptions)) {
      tmpOptions = $extend({}, sendDataOrOptions, methodAndOutputAndUrl)
    } else {
      tmpOptions = $extend({
        [method.toLowerCase() === 'get' ? 'query' : 'body']: sendDataOrOptions
      }, methodAndOutputAndUrl)
    }

    return tmpOptions;
  }

  config(...args) {
    return super.config(this.args2Options(...args));
  }

  output(xhr, options) {
    let outputFn = options.output
    if (typeof outputFn === 'string') {
      const outputStr = options.output
      outputFn = (xhr) => $reflectVal(xhr, outputStr)
    }
    return outputFn ? outputFn(xhr) : xhr
  }

  // 发送前options的处理方法
  async prepare(options) {
    options = await (this.options.prepare ? this.options.prepare(options) : options);

    if (global.location && !options.url) {
      options.url = global.location.pathname;
      options.query = $mix($unserialize(global.location.search.replace('?', '')), options.query);
    }
    if (typeof options.url === 'function') {
      options.url = options.url(options.params);
    }
    options.queryString = this.options.queryStringify(options.query);
    if (typeof options.headers === 'function') {
      options.headers = options.headers(options);
    }

    options.type = options.type.toLowerCase()
    let body = options.body;
    const isFD = isFormData(body);
    const isBD = isBlob(body);
    const isAB = isArrayBuffer(body);
    if (typeof body !== 'string' && !isBD && !isFD && !isAB) {
      body = options.body = this.serialize(options.body);
    }
    let typeContentType = undefined;
    if (typeof body === 'string') {
      if (isJSON(body)) {
        typeContentType = 'application/json';
      } else if (isXML(body)){
        typeContentType = 'application/xml'
      } else if (isUrlEncoded(body)) {
        typeContentType = 'application/x-www-form-urlencoded';
      } else {
        typeContentType = 'text/plain';
      }
    }
    if (isBD) {
      typeContentType = body.type
    }
    options.method = options.method.toUpperCase()
    options.headers['Content-Type'] = options.headers['Content-Type'] || typeContentType || ((options.method === 'POST' || options.method === 'PUT') ? unknowType : undefined)

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
