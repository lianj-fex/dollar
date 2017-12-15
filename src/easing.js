// https://gist.github.com/gre/1650294
const easing = ['quad', 'cubic', 'quart', 'quint'].reduce((memo, power, p) => {
  memo[power] = {
    in(t){
      return Math.pow(t, p + 2);
    }
  };
  return memo;
}, {});

easing.elastic = {
  in(k) {
    let s;
    let a = 0.1;
    const p = 0.4;
    if (k === 0) return 0;
    if (k === 1) return 1;
    if (!a || a < 1) { a = 1; s = p / 4; }
    else s = p * Math.asin(1 / a) / (2 * Math.PI);
    return - (a * Math.pow(2, 10 * (k -= 1)) * Math.sin((k - s) * (2 * Math.PI) / p));
  }
};
easing.bounce = {
  out(k) {
    if (k < (1 / 2.75)) {
      return 7.5625 * k * k;
    } else if (k < (2 / 2.75)) {
      return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
    } else if (k < (2.5 / 2.75)) {
      return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
    } else {
      return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
    }
  }
}

Object.keys(easing).forEach((key) => {
  const easingObj = easing[key];
  easingObj.out = easingObj.out || ((t) => 1 - easingObj.in(1 - t));
  easingObj.in = easingObj.in || ((t) => 1 - easingObj.out(1 - t));
  easingObj.inOut = easingObj.inOut || ((t) => t < .5 ? easingObj.in(t * 2) / 2 : easingObj.out(t * 2 - 1) / 2 + 0.5);
});

export default easing