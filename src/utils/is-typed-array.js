import $is from './is'
export default function(s) {
  return $is(s, /Int8Array|Int16Array|Int32Array|Uint8Array|Uint8ClampedArray|Uint16Array|Uint32Array|Float32Array|Float64Array/)
}