"use strict";

var arr_slice = Array.prototype.slice;

function slice (array, start, end) {
  return arr_slice.call(array, start, end);
}

function store (value) {
  return (is_immutable(value)
          ? value
          : api(store_object({}, value)));
}

function store_object (storage, value) {
  for (var name in value) {
    storage[name] = store(value[name]);
  }
  return storage;
}

function store_array (value) {
}

function store_date (value) {
}

function is_immutable (value) {
  return typeof value !== "object";
}

function is_api (value) {
  return (typeof value === "function" &&
          typeof value.patch === "function");
}

function inherit (storage) {
  function Inheriting () {}
  Inheriting.prototype = storage;
  return new Inheriting;
}

function merge (storage1, storage2) {
  return store_object(inherit(storage1), storage2);
}

function api (storage, deleted) {
  deleted = deleted || {};

  function iface (name) {
    return deleted[name] ? null : storage[name];
  }

  iface.patch = patch;
  iface.rm = rm;
  iface.keys = keys;
  iface.dump = dump;

  return iface;

  function patch (diff_in) {
    // Allows for more than one names, so that we can update a value
    // somewhere deep in the tree and return updated version of the
    // whole tree.

    if (arguments.length >= 2) {
      diff_in = {};
      diff_in[arguments[0]] = arguments[1];
    }

    var storage_diff = {};
    var deleted_diff = {};

    var name, old, value;
    for (name in diff_in) {
      old = storage[name];
      value = diff_in[name];

      deleted_diff[name] = false;
      storage_diff[name] = (!is_immutable(value) && is_api(old)
                            ? old.patch(value)
                            : value);
    }

    return update(storage_diff, deleted_diff);
  }

  function rm (name) {
    if (arguments.length > 1 && is_api(storage[name])) {
      return patch(name, storage[name].rm.apply(null, slice(arguments, 1)));
    }

    var storage_diff = {};
    var deleted_diff = {};

    storage_diff[name] = undefined;
    deleted_diff[name] = true;

    return update(storage_diff, deleted_diff);
  }

  function update (storage_diff, deleted_diff) {
    return api(merge(storage, storage_diff),
               merge(deleted, deleted_diff));
  }

  function keys () {
    var ks = [];
    for (var name in storage) {
      if (!deleted[name]) ks.push(name);
    }
    return ks;
  }

  function dump () {
    var value = {};

    keys().forEach(function (name) {
      var element = storage[name];
      value[name] = element && typeof element.dump === "function" ? element.dump() : element;
    });

    return value;
  }

  // iface.on = on;
  // iface.map = map;
  // iface.forEach = forEach;
  // iface.filter = filter;
  // iface.reduce = reduce;
}

var v1 = store({a: 1, b: 2, c: 3});
var v2 = v1.patch({b: 4, d: [1,5]});
var v3 = v2.patch({a: {e: 7}}).patch("h", 8);
var v4 = v3.rm("a").rm("b").rm("c").rm("d", "0");

var v5 = store({a: {b: 2, c: 3}, d: {e: 5, f: 7}});
var v6 = v5.patch({a: {b: 8, g: {h: 9}}});
var v7 = v6.rm("a", "g", "h");


console.log("1", v1.dump());
console.log("2", v2.dump());
console.log("3", v3.dump());
console.log("4", v4.dump());
console.log("5", v5.dump());
console.log("6", v6.dump());
console.log("7", v7.dump());
