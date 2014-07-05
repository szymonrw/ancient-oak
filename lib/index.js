"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

store.immutable = immutable;

module.exports = store;

var storages = [
  require("./types/primitive"),
  require("./types/array")(ARRAY_KEY_BITS, store),
  require("./types/object")(HASH_KEY_WIDTH, store)
];

// Find first storage that returns is_it() === true
function storage_for (value) {
  var i;
  var length = storages.length;

  for (i = 0;
       i < length && !storages[i].is_it(value);
       ++i);

  return (i < length
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
