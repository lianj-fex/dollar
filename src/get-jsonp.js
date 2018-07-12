import getScript from './get-script';
import serialize from './utils/serialize';
function getJSONP(url, query, callbackName = 'callback') {
  const callback = 'callback' + Date.now();

  return new Promise((resolve, reject) => {
    global[callback] = function (result) {
      resolve(result);
    }

    query[callbackName] = callback;

    getScript(`${url}?${serialize(query)}`).catch(e => reject(e));
  });
}
