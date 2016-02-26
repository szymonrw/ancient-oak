"use strict"

var HASH_BITS = 53
var HASH_MASK = (1 << HASH_BITS) - 1

module.exports = OakObject

var OakArray = require('./OakArray')
var AbstractOak = require('./AbstractOak')

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

OakObject.prototype = new AbstractOak()

OakObject.prototype.ll_new = function ll_new () {
  return new OakObject()
}

OakObject.prototype.get = function get (key) {
  var node = this.data.get(hash_for(key));
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
