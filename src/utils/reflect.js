import $keyParse from './key-parse';
import $int from './int';
export default function reflect(target, name, create) {
  const arrayKey = '!@#%';
  if (name.indexOf('[]') > -1 && name.indexOf('[]') < name.length - 2) {
    throw Error(`[] must be the last word of reflect name: ${name}`);
  }
  name = name.replace('[]', `[${arrayKey}]`);
  const a = $keyParse(name.replace(/[[\].]$/, ''));
  let obj = target;
  let s;
  let tmp;
  let i = 0;
  for (; i < a.length - 1; i++) {
    s = a[i];
    const nextKey = a[i + 1];
    tmp = obj[s];
    if (tmp === null && create) {
      const isArray = nextKey === arrayKey || $int(nextKey) === nextKey;
      if (isArray) {
        obj[s] = [];
      } else {
        obj[s] = {};
      }
      tmp = obj[s];
    }
    obj = tmp;
  }
  let key = a.pop();
  if (key === arrayKey) {
    key = `${obj.length}`;
  }
  return [obj, key];
}