import $forEach from './for-each';
export default function (obj, iterator) {
  return $forEach(obj, (item, i) => { iterator(i, item); });
}
