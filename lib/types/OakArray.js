"use strict"

var KEY_BITS = 5
var KEY_MASK = (1 << KEY_BITS) - 1

module.exports = OakArray

var AbstractOak = require("./AbstractOak")

function OakArray (data, depth, length) {
  this.data = data || []
  this.depth = depth || 1
  this.length = length || 0
}

OakArray.load = function load (array) {
  return array.reduce(function(oak, value, key) {
    return oak.set(key, value)
  }, new OakArray())
}

OakArray.prototype = new AbstractOak()

OakArray.prototype.__new = function __new () {
  return new OakArray()
}

OakArray.prototype.__new_native = function __new_native () {
  return new Array()
}

OakArray.prototype.get = function get (key) {
  var node = this.data

  for (var shift = (this.depth - 1) * KEY_BITS;
       shift >= 0;
       shift -= KEY_BITS) {
    node = node[(key >> shift) & KEY_MASK];
    if (!node) return
  }

  return node
}

OakArray.prototype.forEach = function (f) {
  forEach(this.data, 0, f, this, this.depth - 1)
  return this
}

function forEach (data, key_prefix, f, collection, depth) {
  data.forEach(function (value, part) {
    var key = (key_prefix << KEY_BITS) | part
    if (depth > 0) {
      forEach(value, key, f, collection, depth - 1)
    } else {
      f(value, key, collection)
    }
  })
}

OakArray.prototype.set = function set (key, value) {
  return this.__set(key, AbstractOak.immortalise(value))
}

OakArray.prototype.__set = function __set (key, value) {
  var length = Math.max(this.length, key + 1)
  var new_depth = Math.max(this.depth, key_depth(key))
  var data = (new_depth > this.depth
              ? grow(this.data, new_depth - this.depth)
              : shallow_clone(this.data))

  // Descending to the node
  var node = data

  for (var shift = (new_depth - 1) * KEY_BITS;
       shift >= 5;
       shift -= KEY_BITS) {
    var part = (key >> shift) & KEY_MASK
    var child = node[part] ? shallow_clone(node[part]) : new_node()

    node[part] = child

    node = child
  }

  node[(key >> shift) & KEY_MASK] = value

  return new OakArray(data, new_depth, length)
}

OakArray.prototype.update = function update (key, f) {
  return this.__update(key, function (value, key, all) {
    return AbstractOak.immortalise(f(value, key, all))
  })
}

OakArray.prototype.__update = function __update (key, f) {
  var length = Math.max(this.length, key + 1)
  var new_depth = Math.max(this.depth, key_depth(key))
  var data = (new_depth > this.depth
              ? grow(this.data, new_depth - this.depth)
              : shallow_clone(this.data))

  // Descending to the node
  var node = data

  for (var shift = (new_depth - 1) * KEY_BITS;
       shift >= KEY_BITS;
       shift -= KEY_BITS) {
    var part = (key >> shift) & KEY_MASK
    var child = node[part] ? shallow_clone(node[part]) : new_node()

    node[part] = child

    node = child
  }

  part = (key >> shift) & KEY_MASK
  node[part] = f(node[part], key, this)

  return new OakArray(data, new_depth, length)
}

OakArray.prototype.__push = function (value) {
  return this.__set(this.length, value)
}

OakArray.prototype.push = function (value) {
  return this.set(this.length, value)
}

OakArray.prototype.filter = function filter (f) {
  return this.reduce(function (result, value, key, all) {
    return f(value, key, all) ? result.__push(value) : result
  }, this.__new())
}

function grow (root, levels) {
  var node
  while (levels--) {
    node = root
    root = new_node()
    root[0] = node
  }

  return root
}

function shallow_clone (array) {
  return array.slice()
}

function new_node () {
  return new Array()
}

function key_depth (key) {
  for (var depth = 0; key > 0; ++depth) {
    key = key >> KEY_BITS
  }
  return depth
}
