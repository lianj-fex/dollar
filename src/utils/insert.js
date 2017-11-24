import $isNagitiveZero from './is-nagitive-zero';
/**
 * 向数组插入内容
 * @param array 需要操作的数组
 * @param index [0, array.length], [-0, -array.length] 如果是负0的情况，则push
 * @param items 需要插入的内容
 * @returns {[*]}
 */
export default function(array, index, ...items) {
  const ret = [...array];
  if ($isNagitiveZero(index)) {
    ret.push(...items);
  } else {
    ret.splice(index, 0, ...items);
  }
  return ret;
}