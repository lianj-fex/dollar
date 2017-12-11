import $mix from './utils/mix';
import $own from './utils/own';
/**
 * 用于可配置的基础类
 */
class Configable {
  /**
   * 类的默认配置，可以通过config方法进行修改
   * @returns {{}}
   */
  static get options() {
    if (!$own(this.prototype, 'options')) {
      this.prototype.options = $mix({}, super.options, this.mixOptions);
    }
    return this.prototype.options;
  }
  static set options(val) {
    this.prototype.options = val;
  }
  /**
   * 类的默认配置的配置方法
   * @param options
   */

  static get config() {
    return (...options) => {
      return $mix(this.options, ...options);
    }
  }

  /**
   * 配置实例的配置方法
   * @param options {Object}
   * @returns {{}}
   */
  config(...options) {
    const configed = !!$own(this, 'options');
    if (configed) {
      $mix(this.options, ...options);
    } else {
      this.options = $mix({}, this.constructor.options, ...options);
    }
    return this.options;
  }

}
Configable.prototype.options = {};
export default Configable;
