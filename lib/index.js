"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

module.exports = store;

var api = require("./api");

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

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

inspect(store({asdf: [1,2,{a: 1}], qwer: 456}));
inspect(store([1,2,3,4]));
inspect(store({asdf: [1,2,3], qwer: 456})("asdf").map(function (val) { return val * 100 }));
inspect(store([1,2,3]).rm(1).set(5, 6));
