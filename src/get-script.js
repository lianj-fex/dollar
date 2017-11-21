export default function (url) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const head = document.querySelector('head');
    script.onload = () => {
      resolve()
    };
    script.onerror = () => {
      reject()
    };
    script.src = url;
    head.appendChild(script);
  })
}