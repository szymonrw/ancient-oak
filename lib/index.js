"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

store.immutable = immutable;

module.exports = store;

var storages = [
  require("./types/array")(ARRAY_KEY_BITS, store),
  require("./types/hash")(HASH_KEY_WIDTH, store)
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

function immutable (value) {
  return !storage_for(value);
}

function store (value) {
  var storage = storage_for(value);

  return (storage
          ? storage(value)
          : value);
}

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

// var api = require("./api")({
//   store: store,
//   storageable: storageable
// });

// inspect(store({asdf: [1,2,{a: 1}], qwer: 456}));
// inspect(store([1,2,3,4]));
// inspect(store({asdf: [1,2,3], qwer: 456})("asdf").map(function (val) { return val * 100 }));
// inspect(store([1,2,3]).rm(1).set(5, 6));
// inspect(store([1,2,3]).update(0, function (value) { return value + 123; }));
// inspect(store({a: 1, b: 2}).set("c", {d: 3, e: 4}));
// inspect(store({a: {b: [1,2]}, c: 4}).patch({a: {b: {0: 3, 2: [5,6]}}}));
// inspect(store({a: 4}).update("a", function () { return {b: 2} }));
// inspect(store({a: 123}).map(function () { return {c: 3}} ));

inspect(store({a: 123, b: [0]}).set("c", {d: 3}));
inspect(store({a: 1}).update("b", function () {
  return {c: 2};
}));
inspect(store({a: 1, b: 2}).map(function (val) {
  return {b: val + 1};
}));
inspect(store({asdf: 1}));
inspect(store({asdf: 1}).rm("asdf"));
inspect(store([1,2,3]).push(123));
inspect(store([1,2,3]).pop());
inspect(store({a: {b: 1, c: [1,2,3]}}).patch({a: {b: 3}}).patch({a:{c:[4]}}));
