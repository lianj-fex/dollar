import $mix from './utils/mix';
import $own from './utils/own';
/**
 * 用于可配置的基础类
 */
class Configable {
  /**
   * 类的默认配置，可以通过config方法进行修改，或者直接覆盖options
   * @ignore
   * @returns {object}
   */
  static get options() {
    if (!$own(this.prototype, 'options')) {
      this.prototype.options = $mix({}, super.options, this.mixOptions);
    }
    return this.prototype.options;
  }

  /**
   * 设置类的实例的默认配置
   * @ignore
   * @param options {object}
   */
  static set options(options) {
    this.prototype.options = options;
  }
  /**
   * 配置类的实例的默认配置
   * @param options {object} 配置的对象
   * @returns {object} 配置后的options
   */
  static config(...options) {
    return $mix(this.options, ...options);
  }

  /**
   * 配置实例的配置
   * @param options {object} 配置的对象
   * @returns {object} 配置后的options
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
