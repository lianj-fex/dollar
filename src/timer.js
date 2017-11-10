import $remove from './utils/remove';
import Emitter from './event-emitter';
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
        item.trigger(Timer.event.TICK, [pass, pass / item.timeout, item.timeout - pass, item.tickNum]);
        item.lastTick = now;
      }
      if (item.tickNum >= item.limit || pass >= item.timeout) {
        item.trigger(Timer.event.FINISH, [item.timeout, 1, 0, item.tickNum]);
      }
    });
  }, Timer.interval);
}

/**
 * 定时器
 * @param timeout {boolean|number} 超时时间，定时器开始后，会在该时间后停止
 * @param [interval=200] {number} 通知时隔，定时器开始后，每隔一段时间会进行进度通知
 * @param [limit=Infinity] {number} 进度生成次数限制，超过这个次数，定时器将会停止
 * @param [callback] {function} 成功后绑定的成功时间
 * @class armer.Timer
 * @constructor
 * @extends armer.EventEmitter
 */
class Timer extends Emitter {
  constructor(timeout, interval, limit, callback) {
    super();
    // 总需要的事件
    if (typeof limit !== 'number' && limit < 1) {
      callback = limit; // eslint-disable-line
      limit = Infinity; // eslint-disable-line
    }
    if (typeof interval !== 'number') {
      callback = interval; // eslint-disable-line
      interval = null; // eslint-disable-line
    }
    if (typeof timeout !== 'number') {
      timeout = Infinity; // eslint-disable-line
    }

    this.pass = 0;

    /**
     * 最大超时时间
     * @property timeout
     * @type {number}
     */
    this.timeout = this.total = timeout;
    /**
     * 当前通知数
     * @property tickNum
     * @type {number}
     */
    this.tickNum = 0;
    /**
     * 最大的通知数
     * @property limit
     * @type {number}
     */
    this.limit = limit;
    /**
     * 通知的间隔时间
     * @property interval
     * @type {number}
     */
    this.interval = interval || 200;
    if (typeof callback === 'function') {
      this.onfinish = callback;
      this.trigger('start');
    }
  }
  /**
   * 开始定时器
   * @method start
   */
  start() {
    if (list.length === 0) start();
    if (!~list.indexOf(this)) {
      list.push(this);
    }
    this.startTime = Date.now();
    this.lastTick = this.startTime;
  }
  finish() {
    this.reset();
  }
  /**
   * 停止定时器
   * @method stop
   */
  stop() {
    $remove(list, this);
    if (!list.length) clearInterval(t);
  }
  /**
   * 停止并重设定时器
   * @method reset
   */
  reset() {
    this.stop();
    this.pass = 0;
    this.total = Date.now();
  }
  /**
   * 暂停定时器
   * @method pause
   */
  pause() {
    this.stop();
    const now = Date.now();
    this.pass = getpass(this, now);
    this.total = now;
  }
}
Timer.interval = 13;
Timer.event = {
  /**
   * 启动事件
   * @event start
   */
  START: 'start',
  /**
   * 完成事件
   * @event finish
   */
  FINISH: 'finish',
  /**
   * 停止事件
   * @event stop
   */
  STOP: 'stop',
  /**
   * 通知事件
   * @event tick
   */
  TICK: 'tick'
};

Timer.setTimeout = (callback, timeout) => new Timer(timeout, callback);
Timer.clearTimeout = (timer) => { timer.stop(); };
Timer.setInterval = (callback, interval) => {
  const timer = new Timer(false, interval);
  timer.on(Timer.event.TICK, callback);
  timer.start();
  return timer;
};
Timer.clearInterval = Timer.clearTimeout;

export default Timer;
