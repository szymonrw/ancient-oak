"use strict";

store.is_it = is_it;

module.exports = store;

function store (object) {
  return object;
}

function is_it () {
  return true;
}
