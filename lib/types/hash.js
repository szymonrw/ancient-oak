"use strict";

module.exports = hash;

var storage_config = (function () {
  var string_keys = require("../balanced_storage/string_keys");
  var storage = require("../balanced_storage/storage");

  return config;

  function config (key_width) {
    return storage(string_keys(key_width));
  }
})();

function hash (key_width) {
  var store = storage_config(key_width);

  store.is_it = is_it;

  return store;

  function is_it (object) {
    return typeof object === "object";
  }
}
