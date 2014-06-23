"use strict";

store.is_it = is_it;

module.exports = store;

function is_it (value) {
  return value instanceof Date;
}

function store (date) {
  var value = date.valueOf();
  // have a copy instead of the original
  date = new Date(value);
  Object.freeze(date);

  get.value = value;
  get.dump = dump;
  get.json = json;

  Object.freeze(get);

  return get;

  function get (field) {
    var method = "get" + field.replace(/utc|_.|^./g, function (str) {
      return str.toUpperCase();
    }).replace(/_/g, "");

    return date[method]();
  }

  function dump () {
    return new Date(value);
  }

  function json () {
    return JSON.stringify(dump());
  }
}
