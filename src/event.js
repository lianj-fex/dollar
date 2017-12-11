import $data from './data';

const isIPS = Symbol();
const isDP = Symbol();
const isPS = Symbol();

function getHandlerMap() {
  if (this.getHandlerMap) return this.getHandlerMap();
  const handlerMap = (this._events ? this._events : $data(this, 'events')) || {};
  this._events = handlerMap;
  $data(this, 'events', handlerMap);
  return handlerMap;
}
function getParent() {
  if (this.getParent) return this.getParent();
  return this.$parent || this.parentNode;
}
function getAction(event) {
  if (this.getAction) return this.getAction(event);
  return this[`_${event.type}`] || this[event.type];
}

function wrapEvent(event, fn) {
  return function(...args) {
    const oldEvent = this.$event;
    this.$event = event;
    let result = fn.call(this, ...args);
    this.$event = oldEvent;
    return result
  }
}

async function invokeAction(event, args) {
  const ontype = `on${event.type}`;
  let actFn = getAction.call(this, event);
  if (!event.isDefaultPrevented() && ontype && actFn && this.window !== this) {
    event.actionResult = (await wrapEvent(event, actFn).apply(this, args)) || event.result;
  }
  return event.actionResult;
}

async function invokeHandler(event, args) {
  const ontype = `on${event.type}`;
  let target = event.currentTarget;
  const handlerMap = getHandlerMap.call(target);
  let handlerList = handlerMap[event.type];
  if (handlerList) {
    handlerList = handlerList.length > 1 ? [...handlerList] : handlerList;
    let prevent = false;
    for (let i = 0, l = handlerList.length; i < l; i++) {
      let handler = handlerList[i];
      if (typeof handler === 'function') {
        handler = {
          type: event.type,
          handler: wrapEvent(event, handler)
        };
      }
      const result = await handler.handler.apply(target, args);
      event.result = result;
      if (result === false) {
        prevent = true;
      }
      if (event.isImmediatePropagationStopped()) {
        break;
      }
    }
    if (prevent) {
      event.preventDefault();
    }
  }
  if (ontype && target[ontype] && target[ontype].apply) {
    event.result = target[ontype].call(target, event, ...args);
    if (event.result === false) {
      event.preventDefault();
    }
  }
}

async function displatch(eventType, args) {
  if (!args) {
    args = [];
  }
  if (!Array.isArray(args)) {
    args = [args];
  }
  const event = new Event(eventType);
  event.target = this;
  event.currentTarget = this;

  do {
    await invokeHandler.call(event.currentTarget, event, args);
  } while(event.bubbles && !event.isPropagationStopped() && (event.currentTarget = getParent.call(event.currentTarget)));

  if (!event.onlyHandlers) {
    invokeAction.call(target, event, args)
  }
}


const defaultEventInit = {
  bubbles: false,
  cancelable: false,
  onlyHandlers: false,
  async: false
}

export default class Event {
  type = undefined;
  constructor(type, eventInit) {
    if (!(this instanceof Event)) {
      return new Event(type, eventInit);
    }
    if (typeof type === 'string') {
      eventInit = {
        type,
        ...defaultEventInit,
        ...eventInit
      }
    } else {
      eventInit = {
        ...defaultEventInit,
        ...eventInit
      }
    }
    this[isDP] = false;
    this[isIPS] = false;
    this[isPS] = false;
    this.target = null;
    this.currentTarget = null;
    this.timeStamp = Date.now();
    this.cancelable = eventInit.cancelable;
    this.bubbles = eventInit.bubbles;
    this.type = eventInit.type;
  }
  isImmediatePropagationStopped() {
    return this[isIPS];
  }
  stopImmediatePropagation() {
    this[isIPS] = true;
    if (this.cancelable) {
      this[isDP] = true;
    } else {
      console.warn('Only cancelable event can be cancel')
    }
  }
  stopPropagation() {
    this[isPS] = true;
  }
  isPropagationStopped() {
    return this[isPS];
  }
  preventDefault() {
    if (this.cancelable) {
      this[isDP] = true;
    } else {
      console.warn('Only cancelable event can be cancel')
    }
  }
  isDefaultPrevented() {
    return this[isDP];
  }

  /**
   * 绑定一个事件处理器
   * @param target 绑定的目标
   * @param handlerObj {string} 绑定事件的类型
   * @param fct {function} 绑定的处理器
   * @method on
   */

  static add(target, handlerObj, fct) {
    if (typeof handlerObj === 'string') {
      handlerObj = {
        type: handlerObj,
        handler: fct
      };
    }
    const handlerMap = getHandlerMap.call(target);
    const handlerList = handlerMap[handlerObj.type] = handlerMap[handlerObj.type]	|| [];
    handlerList.push(handlerObj);
  }

  /**
   * 解绑一个或多个事件处理器
   * @param target 绑定的目标
   * @param handlerObj {string} 解绑事件的类型
   * @param [fct] {function} 解绑事件的处理器
   * @async
   * @method off
   */

  static remove(target, handlerObj, fct) {
    const events = getHandlerMap.call(target);
    if (events === undefined) return;
    let typeEvents;
    let index;
    if (typeof handlerObj === 'string') {
      typeEvents = events[handlerObj];
      if (fct) {
        index = typeEvents.findIndex(item => item.handler === fct);
      } else {
        events[handlerObj] = [];
      }
    } else {
      typeEvents = events[handlerObj.type];
      if (handlerObj.handler) {
        index = typeEvents.findIndex(item => item === handlerObj);
      }
    }
    if (index !== -1) {
      typeEvents.splice(index, 1);
    }
  }

  static async trigger(target, eventType, args) {
    return (await displatch.call(this, ...args)).actionResult
  }

  static async dispatch(...args) {
    return (await displatch.call(this, ...args)).result
  }
};
