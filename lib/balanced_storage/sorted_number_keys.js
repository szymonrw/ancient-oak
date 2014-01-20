"use strict";

module.exports = numbers_keys;

function numbers_keys (bits) {
  var width = 1 << bits;
  var mask  = width - 1;

  return {
    zero: 0,
    split_key: function split_key (key, depth) {
      var parts = new Array(depth);

      for (var shift = (depth - 1) * bits, i = 0;
           shift >= 0;
           shift -= bits, ++i) {
        parts[i] = (key >> shift) & mask;
      }

      return parts;
    },
    merge_key: function merge_key (pre, key) {
      return (pre << bits) + key;
    },
    min_depth: function min_depth (key) {
      return Math.ceil(Math.log(key + 1) / Math.log(width));
    },
    new_node: function new_node () {
      return new Array(width);
    },
    new_dump: function new_dump () {
      return [];
    },
    copy: function copy_array (array) {
      return array ? array.concat([]) : new Array(width);
    },
    iterate: function iterate (array, fn) {
      array.forEach(fn);
    }
  }
};
