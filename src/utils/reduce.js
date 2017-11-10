import $forEach from './for-each';
export default function (o, iterator, memo) {
  let result = memo;
  $forEach(o, (item, key) => {
    result = iterator.call(null, result, item, key, o);
  });
  return result;
}
