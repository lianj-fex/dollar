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

async function invokeAsyncAction(event, args) {
  if (event.result === false) {
    event.preventDefault();
  }
  let actionResult;
  if (!event.onlyHandlers) {
    const ontype = `on${event.type}`;
    let actFn = getAction.call(event.target, event);
    if (!event.isDefaultPrevented() && ontype && actFn) {
      actionResult = await wrapEvent(event, actFn).apply(event.target, args);
    }
  }
  return event.actionResult = actionResult || event.result
}
function invokeAction(event, args) {
  if (event.result === false) {
    event.preventDefault();
  }
  let actionResult;
  if (!event.onlyHandlers) {
    const ontype = `on${event.type}`;
    let actFn = getAction.call(event.target, event);
    if (!event.isDefaultPrevented() && ontype && actFn) {
      actionResult = wrapEvent(event, actFn).apply(event.target, args);
    }
  }
  return event.actionResult = actionResult || event.result
}

async function invokeAsyncHandler(event, args) {
  do {
    const target = event.currentTarget;
    const handlerMap = getHandlerMap.call(target);
    let handlerList = handlerMap[event.type];
    if (handlerList) {
      handlerList = handlerList.length > 1 ? [...handlerList] : handlerList;
      for (let i = 0, l = handlerList.length; i < l; i++) {
        let handler = handlerList[i];
        if (typeof handler === 'function') {
          handler = {
            type: event.type,
            handler: wrapEvent(event, handler)
          };
        }
        const result = await handler.handler.call(target, event, ...args);
        if (result !== undefined) {
          event.result = result;
        }
        // 异步与非异步的区别
        if (event.isImmediatePropagationStopped()) {
          break;
        }
      }
    }
    const ontype = `on${event.type}`;
    if (ontype && target[ontype] && target[ontype].apply) {
      event.result = await wrapEvent(event, target[ontype]).call(target, event, ...args);
      // 异步与非异步的区别
    }
  } while(event.bubbles && !event.isPropagationStopped() && (event.currentTarget = getParent.call(event.currentTarget)))
  return event.result;
}

function invokeHandler(event, args) {
  do {
    let target = event.currentTarget;
    const handlerMap = getHandlerMap.call(target);
    let handlerList = handlerMap[event.type];
    if (handlerList) {
      handlerList = handlerList.length > 1 ? [...handlerList] : handlerList;
      for (let i = 0, l = handlerList.length; i < l; i++) {
        let handler = handlerList[i];
        if (typeof handler === 'function') {
          handler = {
            type: event.type,
            handler: wrapEvent(event, handler)
          };
        }
        const result = handler.handler.call(target, event, ...args);
        if (result !== undefined) {
          event.result = result;
        }
        if (event.isImmediatePropagationStopped()) {
          break;
        }
      }
    }
    const ontype = `on${event.type}`;
    if (ontype && target[ontype] && target[ontype].apply) {
      event.result = wrapEvent(event, target[ontype]).call(target, event, ...args);
    }
  } while(event.bubbles && !event.isPropagationStopped() && (event.currentTarget = getParent.call(event.currentTarget)))
  return event.result;
}

function dispatch(proxy, target, event, args) {
  if (!args) {
    args = [];
  }
  if (!Array.isArray(args)) {
    args = [args];
  }
  if (!(event instanceof Event)) {
    event = new Event(event);
  }
  event.target = target;
  event.currentTarget = target;

  if (event.async) {
    return invokeAsyncHandler(event, args).then(() => {
      return invokeAsyncAction(event, args)
    }).then(() => {
      return event[proxy]
    })
  } else {
    invokeHandler(event, args);
    invokeAction(event, args);
    return event[proxy];
  }
}


const defaultEventInit = {
  // 是否冒泡
  bubbles: false,
  // 是否可以取消
  cancelable: true,
  // 只触发handler而不触发默认行为
  onlyHandlers: false,
  // 允许handler异步，handler会依次执行
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
        ...type
      }
    }
    this[isDP] = false;
    this[isIPS] = false;
    this[isPS] = false;
    this.target = null;
    this.originalEvent = eventInit.originalEvent;
    this.currentTarget = null;
    this.timeStamp = Date.now();
    this.result = eventInit.result;
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
      if (this.originalEvent) {
        this.originalEvent.stopImmediatePropagation()
      }
      this[isDP] = true;
    } else {
      console.warn('Only cancelable event can be cancel')
    }
  }
  stopPropagation() {
    if (this.originalEvent) {
      this.originalEvent.stopPropagation()
    }
    this[isPS] = true;
  }
  isPropagationStopped() {
    return this[isPS];
  }
  preventDefault() {
    if (this.cancelable) {
      if (this.originalEvent) {
        this.originalEvent.preventDefault()
      }
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

  static trigger(...args) {
    return dispatch('actionResult', ...args);
  }

  static dispatch(...args) {
    return dispatch('result', ...args);
  }
};
