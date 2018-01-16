import $mix from './utils/mix';
import $extend from './utils/extend';
import $own from './utils/own';
/**
 * 用于可配置的基础类，一般仅用于继承的基类
 * @example
 * class Widget extends Configable {
 *   static mixOptions = {
 *     a: 1
 *   }
 *   constructor(options) {
 *     super();
 *     // 配置实例的option
 *     this.config(options)
 *   }
 * }
 * // Widget.options 为 { a: 1}
 * // 配置类的option
 * Widget.config({c: 3});
 * // Widget.options 为 {a:1, c:3}
 * class Widget2 extends Widget {
 *   static mixOptions = {
 *     b: 2
 *   }
 *   constructor(options) {
 *     super();
 *     // 配置实例的option
 *     this.config(options)
 *     // this.options 为 { a: 1, b: 2}
 *   }
 * }
 * const widget2 = new Widget2({ d: 4 });
 * // widget2.options 为 { a: 1, b:2, c: 3, d:4}
 */
class Configable {
  /**
   * 用于扩展父类options的静态属性，这个静态属性将会通过mix合并父类的options来作为当前类的options
   * @type {object}
   */
  static mixOptions = {};

  /**
   * 类的静态options，配置类的静态options后，所有后续初始化的实例都会被影响
   * @var {object} options2
   * @static
   */

  /**
   * @ignore
   */
  static get options() {
    if (!$own(this.prototype, 'options')) {
      this.prototype.options = $mix({}, this.__proto__.options, this.mixOptions);
    }
    return this.prototype.options;
  }

  /**
   * @ignore
   */
  static set options(options) {
    this.prototype.options = options;
  }
  /**
   * 配置类的实例的默认配置
   * @param {object} options 配置的对象
   * @returns {object} 配置后的options
   */
  static config(...options) {
    let isMix = true;
    if (typeof options[options.length - 1] === 'boolean') {
      isMix = options.pop()
    }
    return (isMix ? $mix : $extend)(this.options, ...options);
  }

  /**
   * 配置实例的配置
   * @param {object} options 配置的对象
   * @returns {object} 配置后的options
   */
  config(...options) {
    let isMix = true;
    if (typeof options[options.length - 1] === 'boolean') {
      isMix = options.pop()
    }
    const configed = $own(this, 'options') !== undefined;
    if (configed) {
      (isMix ? $mix : $extend)(this.options, ...options);
    } else {
      /**
       * 实例的配置，默认继承自父类，可以通过实例的config方法进行初始化及修改，也可以直接覆盖它进行修改
       * @type {object}
       */
      this.options = (isMix ? $mix : $extend)({}, this.constructor.options, ...options);
    }
    return this.options;
  }

}
Configable.prototype.options = {};
export default Configable;
