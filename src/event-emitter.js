import Configable from './configable';
import Event from './event';


export default class EventEmitter extends Configable {
  static trigger(emitter, type, ...args) {
    const e = Event(type);
    args.unshift(e);
    emitter.trigger.apply(emitter, args);
    return e.actionReturns;
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
