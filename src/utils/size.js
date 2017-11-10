import $reduce from './reduce';
export default function (o) {
  return $reduce(o, memo => memo + 1, 0);
}
