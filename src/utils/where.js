import $indexWhere from './index-where';
export default function where(value, iterator) {
  return value[$indexWhere(value, iterator)];
}