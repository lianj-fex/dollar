import Configable from './configable';
import Event from './event';
const onReg = /^(on)([A-Z])/

export default class EventEmitter extends Configable {
  static trigger(emitter, type, ...args) {
    const e = Event(type);
    args.unshift(e);
    emitter.trigger.apply(emitter, args);
    return e.actionReturns;
  }

  constructor(...args) {
    super(...args);
    this.config(...args);
  }

  config(...args) {
    const options = super.config(...args);
    Object.keys(options).forEach((key) => {
      if (onReg.test(key) && typeof options[key] === 'function') {
        this[`on${key.replace(onReg, (_, $1, $2) => $2.toLowerCase())}`] = (e, ...args) => {
          options[key].call(this, ...args)
        }
      }
    })
    return options;
  }

  on(...args) {
    Event.add(this, ...args);
    return this;
  }

  off(...args) {
    Event.remove(this, ...args);
    return this;
  }

  dispatch(...args) {
    return Event.dispatch(this, ...args);
  }

  trigger(...args) {
    return Event.trigger(this, ...args);
  }

  emit(...args) {
    return Event.trigger(this, ...args);
  }
}
