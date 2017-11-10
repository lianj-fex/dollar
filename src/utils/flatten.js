import $keyStringify from './key-stringify';
import $isArray from './is-array';
import $setGroup from './set-group';
import $isPlainObject from './is-plain-object';
import $forEach from './for-each';
export default function (obj, combine, useBracket, withQuote, arrAddBracket) {
  const a = {};
  function s(name, obj, b, p) {
    if ($isPlainObject(obj) || $isArray(obj)) {
      $forEach(obj, (i, item) => {
        s(name.concat(i), item, b, obj);
      });
    } else {
      if ($isArray(p) && combine) {
        name = name.slice(0, -1);
        $setGroup(b, $keyStringify(name, useBracket, withQuote) + (arrAddBracket ? '[]' : ''), obj, true);
      } else {
        b[$keyStringify(name, useBracket, withQuote)] = obj;
      }
    }
  }
  $forEach(obj, (item, key) => {
    s([key], item, a, obj);
  });
  return a;
}