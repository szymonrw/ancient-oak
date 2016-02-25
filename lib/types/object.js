"use strict"

var HASH_BITS = 53
var HASH_MASK = (1 << HASH_BITS) - 1

module.exports = OakObject

var OakArray = require('./array')

function OakObject (data) {
  this.data = data || new OakArray()
}

OakObject.immortalise = function fallback_immortalise (value) {
  return value
}

OakObject.load = function load (object) {
  var oak = new OakObject()
  for (var name in object) {
    oak = oak.set(name, object[name])
  }
  return oak
}

OakObject.prototype.get = function get (key) {
  var node = this.data.get(hash_for(key));
  return node ? node[key] : undefined;
}

OakObject.prototype.set = function set (key, value) {
  var hash = hash_for(key)
  value = OakObject.immortalise(value)

  return new OakObject(this.data.ll_update(hash, function (old) {
    var store = {}

    for (var name in old) {
      store[name] = old[name]
    }

    store[key] = value
    return store
  }))
}

function hash_for (key) {
  var len = key.length
  var fac = HASH_BITS / len
  for (var hash = HASH_MASK, i = 0; i < len; ++i) {
    hash = hash ^ (key.charCodeAt(i) << (i * fac))
  }
  return hash
}
