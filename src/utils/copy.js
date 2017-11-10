import $forEach from './for-each';
import $is from './is';
export default function callee(target) {
  const type = $is(target);
  if (type === 'Date') {
    return new Date(+ target);
  }
  if (type === 'Array' || type === 'Object') {
    const result = type === 'Array' ? [] : {};
    $forEach(target, (item, i) => {
      result[i] = callee(item);
    });
    return result;
  }
  return target;
}