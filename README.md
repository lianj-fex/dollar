## Dollar2

一个工具库

### 使用方法

安装：

```
npm install @lianj/dollar
```

使用：

```
const $ = require('@lianj/dollar');
```

### Warn
* request模块，编译目标 = node，则使用xhr2的node版本，若 = Browser，实际用浏览器原生XMLHttpRequest。
若使用 import $ from '@lianj-fex/dollar/dist/node'， 需注意传入的url必须以协议开头
