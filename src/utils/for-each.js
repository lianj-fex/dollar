import $isArrayLike from './is-array-like';
import $hasOwn from './has-own';
/**
 * 遍历一个对象或者数组
 * @param obj
 * @param iterator
 * @returns {*}
 */
export default function forEach(obj, iterator) {
  let i;
  if ($isArrayLike(obj)) {
    for (i = 0; i < obj.length; i++) {
      if (iterator(obj[i], i) === false) break;
    }
  } else {
    for (i in obj) {
      if ($hasOwn(obj, i)) {
        if (iterator(obj[i], i) === false) break;
      }
    }
  }
  return obj;
}