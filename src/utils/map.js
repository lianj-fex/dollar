import $forEach from './for-each'
import $isArrayLike from './is-array-like'
export default function map(arr, iterator) {
  const result = $isArrayLike(arr) ? [] : {};
  $forEach(arr, (item, key) => {
    result[key] = iterator(item, key);
  });
  return result;
}