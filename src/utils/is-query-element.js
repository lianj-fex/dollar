export default function isQueryElement(node) {
  return !!(node &&
  (node.nodeName
  || (node.prop && node.attr && node.find)));
}