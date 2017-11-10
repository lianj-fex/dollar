import $own from './utils/own';
import $mix from './utils/mix';
import $each from './utils/each';
import $hasOwn from './utils/has-own';
import $extend from './utils/extend';
function bindSuper(f, _superFn) {
  const _super = function () {
    return _superFn.apply(this, arguments);
  };
  const _superApply = function (args) {
    return _superFn.apply(this, args);
  };
  const fn = function (...args) {
    const __super = this._super;
    const __superApply = this._superApply;
    this._super = _super;
    this._superApply = _superApply;
    const returnValue = f.apply(this, args);
    this._super = __super;
    this._superApply = __superApply;
    return returnValue;
  };
  _super.toString = function () {
    return _superFn.toString();
  };
  fn.toString = function () {
    return f.toString();
  };
  return fn;
}
export default function factory(constructor, protoMixin, inherit) {
  if (typeof constructor !== 'function') {
    inherit = protoMixin;
    protoMixin = constructor;
    constructor = null;
  }

  if (typeof protoMixin !== 'object') {
    inherit = protoMixin;
    protoMixin = null;
  }
  if (typeof inherit !== 'function') {
    inherit = null;
  }
  protoMixin = protoMixin || {};
  inherit = inherit || $own(protoMixin, 'inherit') || this;
  const basePrototype = inherit.prototype;

  const prototype = Object.create(basePrototype);


  protoMixin.constructor =
    constructor ||
    $own(protoMixin, 'constructor') ||
    function (...args) {
      this._superApply(args);
    };

  let baseMixin = protoMixin.mixin || {};
  delete protoMixin.mixin;
  $each(protoMixin, (prop, value) => {
    const superFn = inherit.prototype[prop];
    if (typeof value === 'function' && superFn) {
      prototype[prop] = bindSuper(value, superFn);
      // prototype[prop] = value;
    } else {
      prototype[prop] = value;
    }
  });

  constructor = prototype.constructor;
  const options = $mix({}, basePrototype.options, prototype.options);
  constructor.prototype = $extend(prototype, {
    options,
    inherit
  });

  $each(baseMixin, (prop, value) => {
    const superFn = inherit[prop];
    if (typeof value === 'function' && superFn) {
      constructor[prop] = bindSuper(value, superFn);
      // constructor[prop] = value;
    } else {
      constructor[prop] = value;
    }
  });
  constructor.options = options;

  for (let prop in inherit) {
    if ($hasOwn(inherit, prop) && constructor[prop] === undefined) {
      constructor[prop] = inherit[prop];
    }
  }
  return constructor;
}