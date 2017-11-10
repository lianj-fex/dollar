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
  if (this.getHandlerMap) return this.getHandlerMap();
  return this.$parent || this.parentNode;
}
function getAction(event) {
  if (this.getAction) return this.getAction(event);
  return this[`_${event.type}`] || this[event.type];
}

async function doAction(event, args) {
  const ontype = `on${event.type}`;
  const actFn = getAction.call(this);
  if (!event.isDefaultPrevented()) {
    if (ontype && actFn && this.window !== this) {
      event.actionReturns = (await actFn.apply(this, args)) || event.result;
    }
  }
  return event.actionReturns;
}

async function doTrigger(event, args) {
  const ontype = `on${event.type}`;
  const oldEvent = this.$event;
  const handlerMap = getHandlerMap.call(this);
  let handlerList = handlerMap[event.type];
  if (handlerList) {
    handlerList = handlerList.length > 1 ? [...handlerList] : handlerList;
    this.$event = event;
    let prevent = false;
    for (let i = 0, l = handlerList.length; i < l; i++) {
      let handler = handlerList[i];
      if (typeof handler === 'function') {
        handler = {
          type: event.type,
          handler
        };
      }
      const result = await handler.handler.apply(this, args);
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
  if (ontype && this[ontype] && this[ontype].apply) {
    event.result = this[ontype].call(this, event, ...args);
    if (event.result === false) {
      event.preventDefault();
    }
  }
  this.$event = oldEvent;
}



export default class Event {
  type = undefined;
  constructor(type) {
    if (!(this instanceof Event)) {
      return new Event(type);
    }
    this[isDP] = false;
    this[isIPS] = false;
    this[isPS] = false;
    this.type = type;
  }
  isImmediatePropagationStopped() {
    return this[isIPS];
  }
  stopImmediatePropagation() {
    this[isIPS] = true;
    this[isPS] = true;
  }
  stopPropagation() {
    this[isPS] = true;
  }
  isPropagationStopped() {
    return this[isPS];
  }
  preventDefault() {
    this[isDP] = true;
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

  static async dispatch(target, eventType, args, onlyHandlers) {
    if (!args) {
      args = [];
    }
    if (!Array.isArray(args)) {
      args = [args];
    }
    const event = Event(eventType);
    event.target = target;
    event.currentTarget = target;
    await doTrigger.call(target, event, args);

    const parent = getParent.call(target);
    if (parent && !event.isPropagationStopped()) {
      event.currentTarget = parent;
      await doTrigger.call(parent, event, args);
    }

    return onlyHandlers ? undefined : doAction.call(target, event, args);
  }

  static async trigger(target, eventType, args, onlyHandlers) {
    if (!args) {
      args = [];
    }
    if (!Array.isArray(args)) {
      args = [args];
    }
    const event = Event(eventType);
    event.target = target;
    event.currentTarget = target;
    await doTrigger.call(target, event, args);

    return onlyHandlers ? undefined : doAction.call(target, event, args);

  }
};
