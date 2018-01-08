import $forEach from './for-each';
/**
 * forEach方法的别名，注意一点，each的iterator的参数顺序与forEach相反
 * @param {object} obj
 * @param {function} iterator
 * @returns {*}
 */
export default function (obj, iterator) {
  return $forEach(obj, (item, i) => { iterator(i, item); });
}
