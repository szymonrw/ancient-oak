"use strict";

var wrap_all = require("./wrap").all;

module.exports = api;

function api (storage) {
  function get (name) {
    return storage(name);
  }

  wrap_all(storage, get, api);

  get.patch = patch;

  Object.freeze(get);

  return get;

  function patch (diff) {

  }
}
