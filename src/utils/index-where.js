import $forEach from './for-each';
export default function (value, iterator) {
  let ret = -1;
  $forEach(value, (item, i) => {
    if (iterator.call(value, item, i)) {
      ret = i;
      return false;
    }
    return undefined;
  });
  return ret;
}