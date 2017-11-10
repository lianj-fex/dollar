import $toObject from './to-object';
export default function (arr, valFn = 1, keyFn = val => val) {
  return $toObject(arr, valFn, keyFn);
}