import $isArray from './is-array';
/**
 * 为对象设置属性，并且如果多次设置时候，将该属性转换为数组
 * @demo:
 * const a = {};
 * setAsGroup(a, 'b', 111);
 * // a = { 'b': 111 }
 * setAsGroup(a, 'b', 222);
 * // a = { 'b': [111, 222] }
 * @param obj
 * @param key
 * @param item
 * @param array
 */
export default function setGroup(obj, key, item, array) {
  if (!(key in obj)) {
    obj[key] = array ? [item] : item;
    return;
  }
  if (!$isArray(obj[key])) {
    obj[key] = [obj[key]];
  }
  obj[key].push(item);
}