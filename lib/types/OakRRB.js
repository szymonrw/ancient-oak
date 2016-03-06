"use strict"

var KEY_BITS = 2
var ELEMENTS = 1 << KEY_BITS
var MIN_ELEMENTS = ELEMENTS - 1

module.exports = OakArray

function OakArray (data, depth) {
  this.data = data
  this.depth = depth
}

OakArray.prototype.get = function get (key) {
  var node = this.data
  var depth = this.depth

  var index = key
  var i
  while (--depth) {
    for (i = index >> (depth * KEY_BITS); index >= node[0][i]; ++i);

    index -= (i > 0 ? node[0][i - 1] : 0)
    node = node[i + 1]
    if (!node) return
  }

  return node[index]
}

OakArray.prototype.concat = function concat (other) {
  var left, right, depth
  var left_path = []
  var right_path = []

  for (left = this.data, depth = this.depth; depth > 2; --depth) {
    left_path.push(left)
    left = left[left.length - 1]
  }

  for (right = other.data, depth = other.depth; depth > 2; --depth) {
    right_path.push(right)
    right = right[1]
  }

  console.log(left, left_path.map(JSON.stringify).join('>>'))
  console.log(right, right_path.map(JSON.stringify).join('>>'))

  var new_left = [[]]
  var new_right = [[]]

  balance(left, right, new_left, new_right)

  console.log(new_left)
  console.log(new_right)

  return this
}


function balance (left, right, new_left, new_right) {
  var total_length = left.length + right.length - 2
  var i, next, node
  var nodes_pushed = 0

  for (i = 1, next = left[1]; i < total_length; ++i) {
    node = next
    next = i < (left.length - 1) ? left[i + 1] : right[i + 2 - left.length]

    // Skip nodes that were emptied in previous step
    if (node.length === 0) {
      continue
    }

    console.log(node, next)

    if (node.length < MIN_ELEMENTS) {
      var diff = ELEMENTS - node.length
      // TODO: possible optimisation: if node was modified (thus
      // cloned) in previous step we can avoid concat and use push
      // instead
      node = node.concat(next.slice(0, diff))

      // TODO: possible optimisation: we can avoid this operation if
      // diff >= next.length because it's going to be empty in effect
      // and discarded
      next = next.slice(diff)
    }

    (nodes_pushed < ELEMENTS ? new_left : new_right).push(node)
    ++nodes_pushed
  }

  (nodes_pushed < ELEMENTS ? new_left : new_right).push(node)

  put_ranges(new_left)
  put_ranges(new_right)
}

function put_ranges (node) {
  var ranges = node[0]
  var size = 0
  for (var i = 1; i < node.length; ++i) {
    size += node[i].length
    ranges.push(size)
  }
}


;(function test () {
  var a = new OakArray([[9,15],

                        [[2,3,7,9],
                         [1,2], [3], [4,5,6,7], [8,9]],

                        [[3,4,6],
                         [10,11,12], [13], [14,15]]],
                       3);

  var c = a.concat(a);

  for (var i = 0; i < 30; ++i) {
//    console.log(i, c.get(i))
  }
})();
