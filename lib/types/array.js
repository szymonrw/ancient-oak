"use strict";

var wrap_all = require("../wrap").all;

module.exports = array;

var storage_config = (function () {
  var number_keys = require("../balanced_storage/sorted_number_keys");
  var storage = require("../balanced_storage/storage");

  return config;

  function config (bits) {
    return storage(number_keys(bits));
  }
})();

function array (bits) {
  var store = storage_config(bits);

  with_size.is_it = is_it;

  return with_size;

  function with_size (data) {
    return api(store.apply(null, arguments), data.length);
  }

  function is_it (object) {
    return object instanceof Array;
  }
}

function api (storage, size) {
  function get (key) {
    return storage(key);
  }

  wrap_all(storage, get, api_with_size);

  get.set = set;
  get.push = push;
  get.pop = pop;
  get.last = last;
  get.size = size;

  Object.freeze(get);

  return get;

  function set (index, value) {
    return api(storage.set(index, value),
               Math.max(index + 1, size));
  }

  function push (value) {
    return api(storage.set(size, value),
               size + 1);
  }

  function pop () {
    return api(storage.rm(size - 1),
               size - 1);
  }

  function last () {
    return storage(size - 1);
  }

  function api_with_size (value) {
    return api(value, size);
  }
}
