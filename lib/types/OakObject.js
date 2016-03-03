"use strict"

var HASH_BITS = 53
var HASH_MASK = (1 << HASH_BITS) - 1

module.exports = OakObject

var OakArray = require('./OakArray')
var AbstractOak = require('./AbstractOak')

function OakObject (data) {
  this.data = data || new OakArray()
}

OakObject.load = function load (object) {
  var oak = new OakObject()
  for (var name in object) {
    oak = oak.set(name, object[name])
  }
  return oak
}

OakObject.hash = hash

OakObject.prototype = new AbstractOak()

OakObject.prototype.__new = function __new () {
  return new OakObject()
}

OakObject.prototype.__new_native = function __new_native () {
  return new Object()
}

OakObject.prototype.get = function get (key) {
  var node = this.data.get(hash(key));
  return node ? node[key] : undefined;
}

OakObject.prototype.forEach = function forEach(f) {
  var all = this
  this.data.forEach(function (node) {
    for (var key in node) {
      f(node[key], key, all)
    }
  })
  return this
}

OakObject.prototype.set = function set (key, value) {
  return this.__set(key, AbstractOak.immortalise(value))
}

OakObject.prototype.__set = function __set (key, value) {
  return new OakObject(this.data.__update(hash(key), function (old) {
    var node = {}

    for (var name in old) {
      node[name] = old[name]
    }

    node[key] = value
    return node
  }))
}

OakObject.prototype.update = function update (key, f) {
  return this.__update(key, function (value, key, all) {
    return AbstractOak.immortalise(f(value, key, all))
  })
}

OakObject.prototype.__update = function __update (key, f) {
  var all = this

  return new OakObject(this.data.__update(hash(key), function (old) {
    var node = {}

    for (var name in old) {
      node[name] = old[name]
    }

    node[key] = f(node[key], key, all)
    return node
  }))
}

OakObject.prototype.delete = function delete_ (key) {
  return new OakObject(this.data.__update(hash(key), function (old) {
    var node = {}

    for (var name in old) {
      if (name !== key) {
        node[name] = old[name]
      }
    }

    return node
  }))
}

function hash (key) {
  var len = key.length
  var fac = HASH_BITS / len
  for (var result = HASH_MASK, i = 0; i < len; ++i) {
    result = result ^ (key.charCodeAt(i) << (i * fac))
  }
  return result
}
