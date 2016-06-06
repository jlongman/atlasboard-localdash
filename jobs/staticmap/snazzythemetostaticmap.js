/**
 * Originally from:
 *  http://stackoverflow.com/a/23154011/128165
 *  http://jsfiddle.net/s6Dyp/18/
 */

var look_cache = {};

var StaticParams = (function () {
  var _items = [],
    separator = '|',
    _parameters = '';

  function isColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value.toString());
  }

  function toColor(value) {
    return '0x' + value.slice(1);
  }

  function parseJSON(jsonString) {
    var json;
    try {
      json = JSON.parse(jsonString);
    } catch (e) {
      console.log(e);
      return;
    }
    return parse(json);
  }

  function parse(json) {
    _items.length = 0;

    for (var i = 0; i < json.length; i++) {
      var item = json[i],
        hasFeature = item.hasOwnProperty('featureType'),
        hasElement = item.hasOwnProperty('elementType'),
        stylers = item.stylers,
        target = '',
        style = '';

      if (!hasFeature && !hasElement) {
        target = 'feature:all';
      } else {
        if (hasFeature) {
          target = 'feature:' + item.featureType;
        }
        if (hasElement) {
          target = target ? target + separator : '';
          target += 'element:' + item.elementType;
        }
      }

      for (var s = 0; s < stylers.length; s++) {
        var styleItem = stylers[s],
          key = Object.keys(styleItem)[0]; // there is only one per element

        style = style ? style + separator : '';
        style += key + ':' + (isColor(styleItem[key]) ? toColor(styleItem[key]) : styleItem[key]);
      }
      // console.log(target + separator + style);
      _items.push(target + separator + style);
    }
  }

  return {
    get: function () {
      return '&style=' + _items.join('&style=');
    },
    parse: parse
  }
})();

module.exports.StaticParams = StaticParams;
module.exports.look_cache = look_cache;
