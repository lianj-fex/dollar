import $forEach from './for-each';
export default function indexWhereAll(value, iterator) {
  const ret = [];
  $forEach(value, (item, i) => {
    if (iterator.call(value, item, i)) {
      ret.push(i);
    }
  });
  return ret;
}
