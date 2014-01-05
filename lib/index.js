"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

module.exports = store;

var storages = [
  require("./types/array")(ARRAY_KEY_BITS),
  require("./types/hash")(HASH_KEY_WIDTH)
];

function store (value) {
  // Find first storage that returns is_it() === true
  var i;
  for (i = 0;
       i < storages.length && !storages[i].is_it(value);
       ++i);

  return (i >= storages.length
          ? value
          : api(storages[i](value, store)));
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

function api (storage) {
  for (var name in storage) {
    get[name] = wrap(storage[name]);
  }

  Object.freeze(get);

  return get;

  function get (name) {
    return storage(name);
  }
}

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

inspect(store({asdf: [1,2,{a: 1}], qwer: 456}));
inspect(store([1,2,3,4]));
inspect(store({asdf: [1,2,3], qwer: 456})("asdf").map(function (val) { return val * 100 }));
inspect(store([1,2,3]).rm(1));
