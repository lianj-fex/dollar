import $reduce from './reduce';
export default function size(o) {
  return $reduce(o, memo => memo + 1, 0);
}
