"use strict";

module.exports = api;

function api (storage) {
  for (var name in storage) {
    get[name] = wrap(storage[name]);
  }

  get.patch = patch;

  Object.freeze(get);

  return get;

  function get (name) {
    return storage(name);
  }

  function patch (diff) {

  }
}

function wrap (value) {
  return (typeof value === "function"
          ? decorate
          : value);

  function decorate () {
    var result = value.apply(null, arguments);
    return (result.immutable_api
            ? api(result)
            : result);
  }
}
