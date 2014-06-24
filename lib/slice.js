"use strict";

module.exports = slice;

var _slice = Array.prototype.slice;

function slice (array, begin, end) {
  return _slice.call(array, begin, end);
}
