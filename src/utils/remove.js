import $isArrayLike from './is-array-like'
import $indexOf from './index-of'
export default function(form, item){
  const i = $indexOf(form, item);
  if (!!~i) {
    if ($isArrayLike(form)) {
      [].splice.call(form, i, 1);
    } else {
      delete form[i];
    }
  }
}