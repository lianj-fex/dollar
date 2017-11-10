
export default function retry(s, retune, context) {
  let returnTime = 0;

  async function callee(...args) {
    try {
      return await s.call(this, ...args);
    } catch(e) {
      returnTime = returnTime + 1;
      await retune.call(this, e, returnTime, ...args);
      return await callee.call(this, ...args);
    }
  }

  if (typeof retune === 'number') {
    const tmpRetune = retune;
    retune = (e, returnTime) => new Promise((resolve, reject) => { returnTime >= tmpRetune ? reject(e) : resolve(); });
  }

  return async function (...args) {
    context = context || this;
    const result = await callee.call(context, ...args);
    returnTime = 0;
    return result;
  };
}