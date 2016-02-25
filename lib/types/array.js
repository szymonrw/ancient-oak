"use strict"

var KEY_BITS = 5
var KEY_MASK = (1 << KEY_BITS) - 1

module.exports = OakArray

function OakArray (data, depth, length) {
  this.data = data || []
  this.depth = depth || 1
  this.length = length || 0
}

OakArray.immortalise = function fallback_immortalise (value) {
  return value
}

OakArray.load = function load (array) {
  return array.reduce(function(oak, value, key) {
    return oak.set(key, value)
  }, new OakArray())
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

OakArray.prototype.set = function set (key, value) {
  return this.ll_set(key, OakArray.immortalise(value))
}

OakArray.prototype.ll_set = function ll_set (key, value) {
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

OakArray.prototype.ll_update = function ll_update (key, f) {
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
  node[part] = f(node[part])

  return new OakArray(data, new_depth, length)
}

OakArray.prototype.push = function (value) {
  return this.set(this.length, value)
}

OakArray.prototype.forEach = function (f) {

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
