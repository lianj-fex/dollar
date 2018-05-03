import $remove from './utils/remove';
import EventEmitter from './event-emitter';
const list = [];
let t;
function getpass(item, now) {
  let pass = now - item.startTime + item.pass;
  pass = pass > item.timeout ? item.timeout : pass;
  return pass;
}
function start() {
  t = setInterval(() => {
    list.forEach((item) => {
      const now = Date.now();
      const pass = getpass(item, now);
      if (now - item.lastTick >= item.interval) {
        item.tickNum++;
        // [经过时间， 百分比， 剩余时间， 进度生成次数]
        item.trigger('tick', [pass, pass / item.timeout, item.timeout - pass, item.tickNum]);
        item.lastTick = now;
      }
      if (item.tickNum >= item.limit || pass >= item.timeout) {
        item.trigger('finish', [item.timeout, 1, 0, item.tickNum]);
      }
    });
  }, Timer.interval);
}
/**
 * 定时器
 */
export default class Timer extends EventEmitter {
  /**
   * @param {object} options 定时器的配置
   * @param {number} options.timeout  超时时间，定时器开始后，会在该时间后停止
   * @param {number} options.interval 通知时隔，定时器开始后，每隔一段时间会进行进度通知
   * @param {number} options.limit 进度生成次数限制，超过这个次数，定时器将会停止
   * @param {function} options.callback 成功后绑定的成功时间
   */
  static mixOptions = {
    timeout: Infinity,
    interval: 200,
    limit: Infinity,
    callback: undefined
  }
  constructor(...args) {
    super(...args);
    const options = this.options
    this.pass = 0;
    this.timeout = this.total = options.timeout;
    this.tickNum = 0;
    this.limit = options.limit;
    this.interval = options.interval;
    if (typeof options.callback === 'function') {
      this.onfinish = options.callback;
      this.trigger('start');
    }
  }
  /**
   * 开始定时器
   */
  start() {
    if (list.length === 0) start();
    if (!~list.indexOf(this)) {
      list.push(this);
    }
    this.startTime = Date.now();
    this.lastTick = this.startTime;
  }

  /**
   * @ignore
   */
  finish() {
    this.reset();
  }
  /**
   * 停止定时器
   */
  stop() {
    $remove(list, this);
    if (!list.length) clearInterval(t);
  }
  /**
   * 停止并重设定时器
   */
  reset() {
    this.stop();
    this.pass = 0;
    this.total = Date.now();
  }
  /**
   * 暂停定时器
   */
  pause() {
    this.stop();
    const now = Date.now();
    this.pass = getpass(this, now);
    this.total = now;
  };
  static interval = 13;
  static setTimeout = (callback, timeout) => new this({timeout, callback});
  static setInterval = (callback, interval) => {
    const timer = new Timer({interval});
    timer.on('tick', callback);
    timer.start();
    return timer;
  };
  static clearTimeout = (timer) => { timer.stop(); };
  static clearInterval = (timer) => { timer.stop(); };
}

