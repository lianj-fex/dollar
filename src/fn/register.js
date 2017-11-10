import { hyphen as $hyphen, camelCase as $camelCase } from '../utils/case';

export default function register(name, Constructor, bindAttrName) {

  name = $hyphen(name);
  const nameCamel = $camelCase(name);

  $.expr[':'][name] = function (elem) {
    return !!$(elem).data(name);
  };


  $.fn[nameCamel] = function (...args) {
    let ui;
    let command;
    if (!this.length) return this;
    // 判断是否有这个方法
    if (typeof args[0] !== 'string' || !Constructor.prototype[args[0]]) {
      command = null;
    } else {
      command = args.shift();
    }

    const result = this.map(function () {
      const $this = $(this);
      ui = $this.data(name);
      let initArgs = [$this];
      if (!ui) {
        // 没有初始化情况初始化情况
        if (!command) {
          initArgs = initArgs.concat(args);
        }
        ui = new Constructor(...initArgs);
        $this.data(name, ui);
        if (!command) return this;
      } else if (!command) return ui;
      return ui[command](ui, ...args);
    });


    /*
     三种情况
     1. 带参数：初始化实例，并返回this
     2. 不带参数：初始化实例，并返回实例
     3. 第一个参数是字符串：初始化实例，并执行字符串对应的方法，返回其返回值
     */
    if ((!command && args.length) || result[0] === this[0]) {
      return this;
    }
    return result[0];
  };

  $.fn[nameCamel].Constructor = Constructor;

  if (bindAttrName) {
    $(() => {
      $(`[${bindAttrName}=${name}]`).each(function () {
        $(this)[nameCamel]();
      });
    });
  }
}