import $indexWhereAll from './index-where-all';
export default function whereAll(value, iterator) {
  return $indexWhereAll(value, iterator).map(item => value[item]);
}
