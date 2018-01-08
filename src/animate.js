const defaults = {
  during: 300,
  from: 0,
  to: 1,
  easing: x => x,
  raf: global.requestAnimationFrame
};
/**
 * 动画函数，指定初始值以及结束值，fn将会被依次调用
 * @param {function} fn 补间函数，每一个渲染时会调用该函数
 * @param {object} options 动画的配置
 * @param {number} options.during 动画持续的时间，默认300
 * @param {number} options.from 动画值的初始值
 * @param {number} options.to 动画值的结束值
 * @param {function} options.easing 动画缓动函数
 * @param {function} options.raf requestAnimationFrame函数，当然你可以自定义
 */
export default function animate(fn, options) {
  if (typeof options === 'number') {
    options = Object.assign({}, defaults, {
      during: options
    })
  }
  if (typeof options === 'function') {
    options = Object.assign({}, defaults, {
      easing: options
    })
  }
  let start;
  let end;
  function run() {
    const now = Date.now();
    if (!start) {
      start = now;
      end = start + options.during;
    }
    fn((options.to - options.from) * options.easing((now - start) / options.during) + options.from);
    if (now < end) options.raf(run);
  }
  run();
}