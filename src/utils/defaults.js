import $assign from './assign';
/**
 * 合并多个对象，当前者对象存在该键时，则不合并
 * @param {object[]} args 需要合并的对象，args一个为合并的目标，当少于一个时，则this为合并目标
 * @returns {object}
 */
export default function (...args) {
  const target = args.length > 1 ? args.shift() : this;
  return $assign(target, args, {
    deep: false,
    arrDeep: false,
    reflect: false,
    concatArrWhenReflect: false,
    create: false,
    cloneElement: false,
    ignore: ['$$hashKey'],
    ignoreExist: true,
  });
}