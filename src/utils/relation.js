let id = 1;
const relationSymbol = Symbol();
export default function relation(...targets) {
  return targets.map((target) => {
    if (typeof target !== 'object' && typeof target !== 'function') {
      throw new TypeError('target is not object like')
    }
    target[relationSymbol] = target[relationSymbol] || id++;
    return target[relationSymbol];
  }).sort().join('-')
}