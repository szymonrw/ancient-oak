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

function api (storage, deleted, previous) {
  deleted = deleted || {};

  if (!previous) {
    previous = function prev () { return null; };
    previous.keys = function keys () { return []; };
    previous.dump = function dump () { return {}; };
    previous.back = function back () { return previous; };
  }

  get.patch = patch;
  get.rm = rm;
  get.keys = keys;
  get.dump = dump;
  get.back = back;
  get.compact = compact;

  return get;

  function get (name) {
    var value = (deleted[name]
                 ? null
                 : (name in storage
                    ? storage[name]
                    : previous(name)));

    return (arguments.length === 1
            ? value
            : (is_api(value) // recurse
               ? value.apply(null, slice(arguments, 1))
               : null));
  }

  function patch (diff_in) {
    // diff_in can be a tree of updated values to to patch on top of
    // current values.

    if (arguments.length >= 2) {
      diff_in = {};
      diff_in[arguments[0]] = arguments[1];
    }

    var storage_diff = {};

    var name, old, value;
    for (name in diff_in) {
      old = get(name);
      value = diff_in[name];

      storage_diff[name] = (!is_immutable(value) && is_api(old)
                            ? old.patch(value)
                            : store(value));
    }

    return update(storage_diff, {});
  }

  function rm (name) {
    if (arguments.length > 1) {
      var element = get(name);
      if (is_api(element)) {
        return patch(name, element.rm.apply(null, slice(arguments, 1)));
      } else {
        return get;
      }
    }

    var deleted_diff = {};

    deleted_diff[name] = true;

    return update({}, deleted_diff);
  }

  function update (storage_diff, deleted_diff) {
    return api(storage_diff, deleted_diff, get);
  }

  function keys () {
    var ks = previous.keys().filter(function (name) {
      return !deleted[name];
    });

    for (var name in storage) {
      ks.push(name);
    }

    return ks;
  }

  function dump () {
    var value = {};

    keys().forEach(function (name) {
      var element = get(name);
      value[name] = is_api(element) ? element.dump() : element;
    });

    return value;
  }

  function back () {
    return previous;
  }

  function compact () {
    return store(dump());
  }
  // get.on = on;
  // get.map = map;
  // get.forEach = forEach;
  // get.filter = filter;
  // get.reduce = reduce;
}

var v1 = store({a: 1, b: 2, c: 3});
var v2 = v1.patch({b: 4, d: [1,5]});
var v3 = v2.patch({a: {e: 7}}).patch("h", 8);
var v4 = v3.rm("a").rm("b").rm("c").rm("d", "0");

var v5 = store({a: {b: 2, c: 3}, d: {e: 5, f: 7}});
var v6 = v5.patch({a: {b: 8, g: {h: 9}}});
var v7 = v6.rm("a", "g", "h");
var v8 = store({a: 1, b: 2}).rm("a").patch({a: 3});

var assert = require("assert");

console.log("1", v1.dump());
console.log("2", v2.dump());
console.log("3", v3.dump());
console.log("4", v4.dump());
console.log("5", v5.dump());
console.log("6", v6.dump());
console.log("7", v7.dump());

assert.deepEqual(v1.dump(), { a: 1, b: 2, c: 3 });
assert.deepEqual(v2.dump(), { b: 4, d: { '0': 1, '1': 5 }, a: 1, c: 3 });
assert.deepEqual(v3.dump(), { h: 8, a: { e: 7 }, b: 4, d: { '0': 1, '1': 5 }, c: 3 });
assert.deepEqual(v4.dump(), { d: { '1': 5 }, h: 8 });
assert.deepEqual(v5.dump(), { a: { b: 2, c: 3 }, d: { e: 5, f: 7 } });
assert.deepEqual(v6.dump(), { a: { b: 8, g: { h: 9 }, c: 3 }, d: { e: 5, f: 7 } });
assert.deepEqual(v7.dump(), { a: { g: {}, b: 8, c: 3 }, d: { e: 5, f: 7 } });
assert.deepEqual(v8.dump(), { a: 3, b: 2});
assert.deepEqual(v6("a", "g", "h"), 9);
assert.deepEqual(v6("a", "b", "c", "d"), null);
assert.deepEqual(v4.dump(), v4.compact().dump());
assert.deepEqual(v4.compact().back().dump(), {});
