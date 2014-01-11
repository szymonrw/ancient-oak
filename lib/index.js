"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

module.exports = store;

var api = require("./api")({
  store: store,
  storageable: storageable
});

var storages = [
  require("./types/array")(ARRAY_KEY_BITS),
  require("./types/hash")(HASH_KEY_WIDTH)
];

// Find first storage that returns is_it() === true
function storage_for (value) {
  var i;
  for (i = 0;
       i < storages.length && !storages[i].is_it(value);
       ++i);

  return (i < storages.length
          ? storages[i]
          : null);
}

function storageable (value) {
  return !!storage_for(value);
}

function store (value) {
  var storage = storage_for(value);

  return (storage
          ? api(storage(value, store))
          : value);
}

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

inspect(store({asdf: [1,2,{a: 1}], qwer: 456}));
inspect(store([1,2,3,4]));
inspect(store({asdf: [1,2,3], qwer: 456})("asdf").map(function (val) { return val * 100 }));
inspect(store([1,2,3]).rm(1).set(5, 6));
inspect(store([1,2,3]).update(0, function (value) { return value + 123; }));
inspect(store({a: 1, b: 2}).set("c", {d: 3, e: 4}));
inspect(store({a: {b: [1,2]}, c: 4}).patch({a: {b: {0: 3, 2: [5,6]}}}));
