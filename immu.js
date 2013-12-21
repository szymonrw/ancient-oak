"use strict";

function store (value) {
  return (is_immutable(value)
          ? value
          : api(object_storage({}, value)));
}

function object_storage (storage, value) {
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

function inherit (storage) {
  function Inheriting () {}
  Inheriting.prototype = storage;
  return new Inheriting;
}

function merge (storage1, storage2) {
  return object_storage(inherit(storage1), storage2);
}

function api (storage) {
  function iface (name, value) {
    // arg is str or int => return immutable value
    if (arguments.length < 2) {
      return storage[name];
    } else {
      return update(name, value);
    }
  }

  iface.keys = keys;
  iface.update = update;
  iface.dump = dump;

  return iface;

  function update () {
    var updates;

    if (arguments.length == 1) {
      updates = arguments[0];
    }
    else {
      updates = {};
      updates[arguments[0]] = arguments[1];
    }

    return api(merge(storage, updates));
  }

  function keys () {
    var ks = [];
    for (var k in storage) {
      ks.push(k);
    }
    return ks;
  }

  function dump () {
    var value = {};
    var name, element;
    for (name in storage) {
      element = iface(name);
      value[name] = typeof element === "function" ? element.dump() : element;
    }
    return value;
  }

  // iface.on = on;
  // iface.map = map;
  // iface.forEach = forEach;
  // iface.filter = filter;
  // iface.reduce = reduce;
  // iface.rm = rm;
}

var v1 = store({a: 1, b: 2, c: 3});
var v2 = v1.update({b: 4, d: [1,5]});
var v3 = v2.update("a", {e: 7}).update("f", 8);

console.log(v1.dump());
console.log(v2.dump());
console.log(v3.dump());
