import $forEach from './for-each';
import $is from './is';
/**
 * 深度拷贝一个变量
 * @template target
 * @param {target} target 需要拷贝的目标
 * @returns {target}
 */
export default function copy(target) {
  const type = $is(target);
  if (type === 'Date') {
    return new Date(+ target);
  }
  if (type === 'Array' || type === 'Object') {
    const result = type === 'Array' ? [] : {};
    $forEach(target, (item, i) => {
      result[i] = copy(item);
    });
    return result;
  }
  return target;
}