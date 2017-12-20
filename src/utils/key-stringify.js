import $reduce from './reduce';
import $is from './is';
export default function keyStringify(arr, useBracket, withQuote) {
  // eslint-disable-next-line
  if (withQuote === undefined) withQuote = true;
  return $reduce(arr, (memo, key, i) => {
    if (i === 0) return memo + key;
    else if ($is(key, 'number')) {
      return `${memo}[${key}]`;
    } else if (!useBracket) {
      return `${memo}.${key}`;
    } else if (withQuote) {
      return `${memo}["${key}"]`;
    }
    return `${memo}[${key}]`;
  }, '');
}