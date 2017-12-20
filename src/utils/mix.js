import $assign from './assign';
export default function mix(...args) {
  const target = args.length > 1 ? args.shift() : this;
  return $assign(target, args, {
    deep: true,
    arrDeep: false,
    reflect: true,
    concatArrWhenReflect: true,
    create: true,
    cloneElement: false,
    ignore: ['$$hashKey'],
    ignoreExist: false,
  });
}
