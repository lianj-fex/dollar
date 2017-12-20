import $indexWhere from './index-where';
export default function indexOf(from, item) {
  return $indexWhere(from, v => v === item);
}
