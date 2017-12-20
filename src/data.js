const dataMap = new WeakMap();
export default function data(obj, keys, value) {
  let dataItem = dataMap.get(obj);
  const hasData = dataItem;
  dataItem = dataItem || {};
  if (value === undefined && !hasData) {
    return undefined;
  }
  if (keys === undefined) {
    return dataItem;
  }
  if (value === undefined) {
    return dataItem[keys];
  }
  if (!hasData) dataMap.set(obj, dataItem);
  dataItem[keys] = value;
  return value;
};