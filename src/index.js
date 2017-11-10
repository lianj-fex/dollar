import $each from './utils/each';
import $hasOwn from './utils/has-own';
import * as utils from './utils/index';
import $factory from './factory';
import Event from './event';
import EventEmitter from './event-emitter';
import XhrRequest from './request';
import Cookie from './cookie';
/*
import Emoji from './emoji';
*/
const $ = global.$ ? global.$ : {};
$each(utils, (name, fn) => {
  if (name !== 'default' && !$hasOwn($, name)) {
    $[name] = fn;
  }
});

if (!$hasOwn($, 'Event')) {
  $.Event = Event;
}
$.factory = $factory;
$.EventEmitter = EventEmitter;
$.XhrRequest = XhrRequest;
$.Cookie = Cookie;
$.cookie = new Cookie();

/*
$.Emoji = Emoji;
$.emoji = new Emoji();
if ($.fn) {
  $.fn.parseEmoji = function (options) {
    return this.each(function () {
      const $this = $(this);
      $this.html($.emoji.parseHtml($this.html(), options));
    });
  };
}
*/

export default $;