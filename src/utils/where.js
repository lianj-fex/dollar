import $indexWhere from './index-where';
export default function (value, iterator) {
  return value[$indexWhere(value, iterator)];
}