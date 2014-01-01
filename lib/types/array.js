"use strict";

var BITS = 5;

module.exports = array_config(BITS);

function storage_config (bits) {
  var number_keys = require("../balanced_storage/sorted_number_keys")(bits);
  return require("../balanced_storage/storage")(number_keys);
}

function array_config (bits) {
  var store = array(storage_config(bits));
  store.reconfigure = array_config;
  return store;
}

function array (store_array) {
  return store;

  function store (data) {
    return api(store_array(data), data.length);
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
}
