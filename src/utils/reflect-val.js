import $reflect from './reflect';
export default function reflectVal(target, name, defaultVal) {
  let ret;
  try {
    const ref = $reflect(target, name, false);
    ret = ref[0][ref[1]];
  } catch (e) {
    ret = defaultVal;
  }
  return ret;
}