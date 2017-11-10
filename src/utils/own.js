import $hasOwn from './has-own';
export default function (obj, key) {
  if ($hasOwn(obj, key)) return obj[key];
  return undefined;
}