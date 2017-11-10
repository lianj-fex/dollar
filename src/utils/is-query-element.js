export default function (node) {
  return !!(node &&
  (node.nodeName
  || (node.prop && node.attr && node.find)));
}