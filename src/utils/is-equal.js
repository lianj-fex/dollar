function eq(a, b, aStack, bStack) {
  // 0 === -0 为true，但实际上不应该相等
  // http://wiki.ecmascript.org/doku.php?id=harmony:egal
  // http://www.w3.org/TR/xmlschema11-2/
  if (a === b) return a !== 0 || 1 / a == 1 / b;
  // 在a或b为null的时候，需要严格判断，因为null == undefined
  if (a == null || b == null) return a === b;
  // 比较类型（类名）
  const className = $.stringType(a);
  if (className !== $.stringType(b)) return false;
  switch (className) {
    // 字符串，数字，日期，布尔比较值.
    case 'String':
      // 通过包装对象解决 '5' 实际上等于 String(5) 的情况
      return a == String(b);
    case 'Number':
      // 比较数字
      // NaN实际上是相等的，但不然，但通过以下方式仍可比较
      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
    case 'Date':
    case 'Boolean':
      // 日期和布尔量强行转换成数字进行比较
      // 非法日期转换将为NaN，所以仍然保持不相等
      return +a == +b;
    // 正则则比较其表达式以及标记
    case 'RegExp':
      return a.source == b.source &&
        a.global == b.global &&
        a.multiline == b.multiline &&
        a.ignoreCase == b.ignoreCase;
  }
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  var length = aStack.length;
  while (length--) {
    // 线性搜索
    if (aStack[length] == a) return bStack[length] == b;
  }
  // 将第一个对象堆到遍历堆栈中
  aStack.push(a);
  bStack.push(b);
  var size = 0, result = true;
  // 递归比较数组和对象
  if (className === '[object Array]') {
    // 比较数组长度是否相同确定是否深度比较
    size = a.length;
    result = size === b.length;
    if (result) {
      // 深度比较，忽略key非数字的成员
      while (size--) {
        if (!(result = eq(a[size], b[size], aStack, bStack))) break;
      }
    }
  } else {
    // 构造体不同的对象将被认为不相等
    var aCtor = a.constructor, bCtor = b.constructor;
    if (aCtor !== bCtor && !($.isFunction(aCtor) && (aCtor instanceof aCtor) &&
      $.isFunction(bCtor) && (bCtor instanceof bCtor))) {
      return false;
    }
    // 深度递归比较对象
    for (var key in a) {
      if ($.hasOwn(a, key)) {
        // 计算预测成员数量
        size++;
        // 深度比较每个成员
        if (!(result = $.hasOwn(b, key) && eq(a[key], b[key], aStack, bStack))) break;
      }
    }
    // 确保每个对象都包含相同数量的属性
    if (result) {
      for (key in b) {
        if ($.hasOwn(b, key) && !(size--)) break;
      }
      result = !size;
    }
  }
  // 移除遍历对象堆栈第一个对象
  aStack.pop();
  bStack.pop();
  return result;
}
export default function (a, b) {
  return eq(a, b, [], []);
}