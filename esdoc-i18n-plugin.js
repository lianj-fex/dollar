const transalteMap = require('./i18n/zh-cn');
function replaceAll(target, search, replacement) {
  return target.replace(new RegExp(search, 'g'), replacement)
}
exports.onHandleContent = function(ev) {
  if (!ev.data.fileName.includes('.html')) return;
  let html = ev.data.content;
  Object.keys(transalteMap).forEach((key) => {
    html = replaceAll(html, key, transalteMap[key])
  });
  ev.data.content = html;
};