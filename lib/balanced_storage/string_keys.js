"use strict";

module.exports = string_keys;

function string_keys (width) {
  return {
    zero: "",
    split_key: function split_key (key, depth) {
      var parts = new Array(depth);
      var padding = depth - min_depth(key);
      var i, k;
      for (i = 0; i < padding; ++i) {
        parts[i] = "";
      }
      for (k = 0; i < depth; ++i, ++k) {
        parts[i] = key.substr(k * width, width);
      }
      return parts;
    },
    merge_key: function merge_key (pre, key) {
      return pre + key;
    },
    min_depth: min_depth,
    new_node: new_object,
    new_dump: new_object,
    copy: function copy_object (object) {
      var result = {};
      for (var prop in object) {
        result[prop] = object[prop];
      }
      return result;
    },
    iterate: function iterate (object, fn) {
      for (var prop in object) {
        fn(object[prop], prop, object);
      }
    }
  };

  function new_object () {
    return {};
  }

  function min_depth (key) {
    return Math.ceil(key.length / width);
  }
}
