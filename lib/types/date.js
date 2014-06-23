"use strict";

store.is_it = is_it;

module.exports = store;

function is_it (value) {
  return value instanceof Date;
}

function store (date) {
  var value = date.valueOf();

  get.dump = get;
  get.json = json;

  return get;

  function get () {
    return new Date(value);
  }

  function json () {
    return JSON.stringify(new Date(value));
  }
}
