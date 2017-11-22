
export default function retry(s, retune, context) {
  let returnTime = 0;

  async function callee(...args) {
    try {
      return await s.call(this, ...args);
    } catch(e) {
      returnTime = returnTime + 1;
      try {
        await retune.call(this, e, returnTime, ...args);
      } catch(e1) {
        throw e;
      }
      return await callee.call(this, ...args);
    }
  }

  if (typeof retune === 'number') {
    const tmpRetune = retune;
    retune = (e, returnTime) => { if (returnTime >= tmpRetune) { throw new Error('retry too many time') } };
  }

  return async function (...args) {
    context = context || this;
    const result = await callee.call(context, ...args);
    returnTime = 0;
    return result;
  };
}