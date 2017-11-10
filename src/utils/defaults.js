import $assign from './assign';
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