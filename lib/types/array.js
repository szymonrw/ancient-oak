"use strict";

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

  wrap.is_it = is_it;

  return wrap;

  function wrap (data, value_transform) {
    return api(store(data, value_transform), data.length);
  }

  function is_it (object) {
    return object instanceof Array;
  }
}

function api (storage, size) {
  function get (key) {
    return storage(key);
  }

  get.forEach = storage.forEach;
  get.reduce = storage.reduce;
  get.map = map;
  get.data = storage.data;

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

  function map (fn) {
    return api(storage.map(fn), size);
  }
}
