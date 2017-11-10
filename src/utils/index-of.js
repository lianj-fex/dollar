import $indexWhere from './index-where';
export default function (from, item) {
  return $indexWhere(from, v => v === item);
}
