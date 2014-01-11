"use strict";

var wrap_all = require("./wrap").all;

module.exports = api_config;

function api_config (options) {
  var store = options.store;
  var storageable = options.storageable;

  return api;

  function api (storage) {
    function get (name) {
      return storage(name);
    }

    wrap_all(storage, get, api);

    get.patch = patch;
    get.set = set;
    get.update = update;
    get.map = map;

    Object.freeze(get);

    return get;

    function set (key, value) {
      return api(storage.set(key, store(value)));
    }

    function update (key, fn) {
      return api(storage.update(key, function (value) {
        return store(fn(value));
      }));
    }

    function map (fn) {
      return api(storage.map(function () {
        return store(fn.apply(null, arguments));
      }));
    }

    function patch (diff) {
      var result = get;

      for (var name in diff) {
        result = result.update(name, patch_field(diff[name]));
      }

      return result;
    }

    function patch_field (value) {
      return function (old) {
        if (old && old.immutable_api) {
          if (storageable(value)) {
            return old.patch(value);
          } else {
            return value;
          }
        } else {
          return store(value);
        }
      }
    }
  }
}
