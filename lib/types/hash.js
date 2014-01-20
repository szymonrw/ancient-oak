"use strict";

module.exports = hash_storage_config;

function hash_storage_config (width, store) {
  var string_keys = require("../balanced_storage/string_keys");
  var storage = require("../balanced_storage/storage");

  return storage({
    keys: string_keys(width),
    is_it: is_it,
    store: store
  });
}

function is_it (value) {
  return typeof value === "object";
}
