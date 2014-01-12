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

  if (action === "rm" && key === size - 1) {
    size = size - 1;
  } else {
    size = Math.max(size, key + 1);
  }

  return { size: size };
}

function extend (api) {
  api.push = push;
  api.pop = pop;

  api.size = 0;

  function push (value) {
    return api.set(api.size, value);
  }

  function pop (value) {
    return api.rm(api.size - 1);
  }
}
