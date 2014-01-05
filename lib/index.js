"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2

var storages = [
  require("./types/array")(ARRAY_KEY_BITS),
  require("./types/hash")(HASH_KEY_WIDTH),
  require("./types/generic")
];

function store (object) {
  // Find first storage that returns is_it() === true
  var i;
  for (i = 0;
       !storages[i].is_it(object) && i < storages.length;
       ++i);

  return storages[i](object, store);
}

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

inspect(store({asdf: [1,2,{a: 1}], qwer: 456}));
inspect(store([1,2,3,4]));
console.log(store({asdf: [1,2,3], qwer: 456})("asdf")(0));
