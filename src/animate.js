const defaults = {
  during: 300,
  from: 0,
  to: 1,
  easing: x => x,
  raf: global.requestAnimationFrame
};
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