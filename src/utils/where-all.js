import $indexWhereAll from './index-where-all';
export default function (value, iterator) {
  return $indexWhereAll(value, iterator).map(item => value[item]);
}
