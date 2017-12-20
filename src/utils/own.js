import $hasOwn from './has-own';
export default function own(obj, key) {
  if ($hasOwn(obj, key)) return obj[key];
  return undefined;
}