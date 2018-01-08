/*

// http://unicode.org/emoji/charts/full-emoji-list.html
let emojiList = {};
$.ajax({url:'http://unicode.org/emoji/charts/emoji-annotations.html'}).done(function(data){
  let aliasMap = {}
  let groupId = -1;
  $('table', data).find('tr').each(function () {
    let $tr = $(this);
    if (!$tr.find('th').length) {
      let char = $tr.find('td:eq(1) img:eq(0)').attr('alt');
      aliasMap[char] = $tr.find('td:eq(0)').text().split(',').map(function (str) {
        return ':' + str.trim() + ':';

      });
    }
  });
  $('table').find('tr').each(function () {
    let $tr = $(this);
    if (!$tr.find('th').length) {
      let char = $tr.find('td:eq(2)').text();
      emojiList[chart] = {
        char: char,
        name: $tr.find('td:eq(15)').text(),
        keywords: $tr.find('td:eq(17)').text().split('|').map(function (str) {
          return str.trim()
        }),
        group: '',
        alias: aliasMap[chart]
      }
    } else {
       groupId ++;
    }
  })
})

 */
import $mix from '../utils/mix';
import $extend from '../utils/extend';
import $each from '../utils/each';
import Configable from '../configable';

const emojiList = require('./emoji-list.json');
Object.keys(emojiList).forEach((key) => {
  emojiList[key] = {
    char: key,
    alias: emojiList[key]
  };
});


function detect () {
  if (detect.status === null) {
    const window = global.window;
    if (!window) {
      return false;
    }

    const pixelRatio = window.devicePixelRatio || 1;
    const offset = 12 * pixelRatio;
    const node = window.document.createElement('canvas');

    const ctx = node.getContext('2d');
    if (!ctx) {
      return false;
    }

    ctx.fillStyle = '#f00';
    ctx.textBaseline = 'top';
    ctx.font = '32px Arial';
    ctx.fillText('\ud83d\udc28', 0, 0); // U+1F428 KOALA

    detect.status = ctx.getImageData(offset, offset, 1, 1).data[0] !== 0;
  }

  return detect.status;
}

detect.status = null;

function createEmojiRegexpStr(string) {
  let t = '';
  for (let n = 0; n < string.length; n++) {
    t += `\\u${(`000${string[n].charCodeAt(0).toString(16)}`).substr(-4)}`;
  }
  return t;
}

function parse(t) {
  for (var n = [], r = 0, o = 0, h = 0; h < t.length;)r = t.charCodeAt(h++), o ? (n.push((65536 + (o - 55296 << 10) + (r - 56320))), o = 0) : r >= 55296 && 56319 >= r ? o = r : n.push(r);
  return n;
}

function createRegexp(list) {
  return new RegExp((list.map((str) => createEmojiRegexpStr(str))).join('|'), 'g');
}


class Emoji extends Configable {
  static mixOptions = {
    // 需要转换的列表
    charList: emojiList,
    imgType: 'png',
    basePath: {
      png: './img/emoji/png/'
    },
    isParse() {
      return !detect();
    },
    parseImgUrl(emoji){
      const type = emoji.imgType;
      let base = emoji.basePath;
      base = typeof base === 'string' ? base : base[type];
      return `${base}${emoji.codeHex}.${type}`;
    },
    template(data) {
      return `<i class="emoji emoji-${data.code}${data.img ? ' emoji-image' : ''}" ${data.img ? `style="background-image:url(${data.img})"` : ''}>${data.string}</i>`;
    }
  }
  constructor(options) {
    super(options);
    this.config(options);
    this.charCodeMap = this.normalizeEmojiList(this.options.charList)
    let replaceArray = [];
    const isParse = this.isParse();
    this.aliasMap = {};
    $each(this.charCodeMap, (_, item) => {
      (item.alias || []).forEach((alias) => {
        this.aliasMap[alias] = item.char;
        replaceArray.push(alias);
      });
      if (isParse) replaceArray.push(item.char);
    });
    if (replaceArray.length) {
      this.regexp = createRegexp(replaceArray);
    }
    return this;
  }
  normalizeEmojiList(item, key, extend){
    let result;
    const isArray = Array.isArray(item);
    if (typeof item === 'object' && !(key in emojiList) && !('char' in item)) {
      result = {};
      const extra = isArray ? {
        group: key ? key : undefined
      } : {};
      $each(item, (key, item) => {
        item = this.normalizeEmojiList(item, key, extra);
        if (item.char) {
          result[item.char] = item;
        } else {
          $extend(result, item);
        }
      });
      return result;
    } else if (isArray) {
      return this.normalizeEmojiList(key, key, {
        'alias[]': item
      });
    } else {
      if (typeof item === 'object') {
        result = $extend({}, emojiList[item.char], item);
      } else {
        result = emojiList[item];
        if (!result) {
          result = this.normalizeEmojiList(key, key, {
            'alias[]': item
          });
        }
      }
      result = $mix({}, result, extend);
      result.code = result.code || this.parse(result.char);
      result.codeHex = result.code.map((code) => code.toString(16))
      return result;
    }
  }
  isParse() {
    return typeof this.options.isParse === 'function' ? this.options.isParse() : !!this.options.isParse;
  }
  parse(str) {
    return parse(str.replace(/\ufe0f|\u200d/gm, ''));
  }
  getEmojiOptions(s) {
    return $extend({}, this.charCodeMap[s], this.options);
  }
  parseImg(s) {
    const emojiOptions = this.getEmojiOptions(s);
    return this.options.parseImgUrl(emojiOptions);
  }
  parseHtml(s) {
    const isParse = this.isParse();
    if (this.regexp) {
      return s.replace(this.regexp, (string) => {
        let ret = string;
        if (this.aliasMap[string]) {
          ret = this.aliasMap[string];
        }
        if (isParse) {
          const emojiOptions = this.getEmojiOptions(ret);
          ret = this.options.template($extend({}, emojiOptions, {
            string,
            img: this.options.parseImgUrl(emojiOptions)
          }));
        }
        return ret;
      });
    } else {
      return s;
    }
  }
};
export default Emoji