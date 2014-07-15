"use strict";

module.exports = array_storage_config;

function array_storage_config (bits, store) {
  var number_keys = require("../balanced_storage/sorted_number_keys");
  var storage = require("../balanced_storage/storage");

  return storage({
    keys: number_keys(bits),
    is_it: is_it,
    store: store,
    extend: extend,
    props: props
  });
}

function is_it (value) {
  return value instanceof Array;
}

function props (old_props, action, key) {
  var size = old_props.size || 0;
  if (typeof key === "string") {
    key = parseInt(key, 10);
  }

  size = Math.max(size, key + 1);

  return { size: size };
}

function extend (api, store) {
  api.push = push;
  api.pop = pop;
  api.filter = filter;
  api.slice = slice;

  api.size = 0;

  function push (value) {
    return api.set(api.size, value);
  }

  function filter (fn) {
    return api.reduce(function (result, value, key) {
      return (fn(value, key)
              ? result.push(value)
              : result);
    }, store([]));
  }

  function slice (start, end) {
    if (arguments.length === 1) {
      end = api.size;
    } else if (end < 0) {
      end = api.size + end;
    }

    return api.filter(function (_, key) {
      return key >= start && key < end;
    });
  }

  function pop () {
    var new_size = api.size - 1;

    return api.filter(function (_, key) {
      return key < new_size;
    });
  }
}
