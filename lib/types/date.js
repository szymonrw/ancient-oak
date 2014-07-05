"use strict";

store.is_it = is_it;

module.exports = store;

var slice = require("../slice");

function is_it (value) {
  return value instanceof Date;
}

function store (date) {
  var value = date.valueOf();
  date = null; // allow the input value to be GC'd

  get.value = value;
  get.dump = dump;
  get.json = json;
  get.set = set;
  get.update = update;
  get.patch = patch;

  Object.freeze(get);

  return get;

  function get (field) {
    // recreate date object and cache it
    if (!date) date = dump();

    var method = "get" + camel_case(field);

    return date[method]();
  }

  function set (field) {
    var method = "set" + camel_case(field);
    var args = slice(arguments, 1);

    var new_date = dump();
    new_date[method].apply(new_date, args);

    return store(new_date);
  }

  function update (field, modify) {
    var prop = camel_case(field);
    var set_method = "set" + prop;
    var get_method = "get" + prop;

    var new_date = dump();

    var field_value = modify(new_date[get_method]());
    new_date[set_method](field_value);

    return store(new_date);
  }

  function patch (fields) {
    var new_date = dump();

    Object.keys(fields).forEach(function (field) {
      var method = "set" + camel_case(field);
      var value = fields[field];
      new_date[method](value);
    });

    return store(new_date);
  }

  function dump () {
    return new Date(value);
  }

  function json () {
    return JSON.stringify(dump());
  }

  function camel_case (field) {
    return field.replace(/utc|_.|^./g, function (str) {
      return str.toUpperCase();
    }).replace(/_/g, "");
  }
}
