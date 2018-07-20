import $assign from './assign';
import $is from './is';
export default function (...args) {
  let deep;
  let target = this;
  if ($is(args[0]) === 'Boolean') {
    deep = args.shift();
  }
  if (args.length > 1) {
    target = args.shift();
  }
  return $assign(target, args, {
    deep,
    clearWhenUndefined: false
  });
}