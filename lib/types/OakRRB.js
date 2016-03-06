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
  var depth, last
  var left_path = [this.data]
  var right_path = [other.data]

  for (last = this.data, depth = this.depth; depth > 1; --depth) {
    last = last[last.length - 1]
    left_path.push(last)
  }

  for (last = other.data, depth = other.depth; depth > 1; --depth) {
    last = last[1]
    right_path.push(last)
  }

  for (depth = this.depth - 2; depth >= 0; --depth) {
    var left = left_path[depth]
    var right = right_path[depth]
    var middle_left = new_left
    var middle_right = new_right
    var new_left = [[]]
    var new_right = [[]]

    balance(left, right, middle_left, middle_right, new_left, new_right)

    console.log(new_left)
    console.log(new_right)
    console.log("===")
  }

  return this
}


function balance (left, right, middle_left, middle_right, new_left, new_right) {
  var k, i, next, node, diff
  var nodes_pushed = 0
  var left_length = left.length
  var total_length = left_length + right.length - 2

  console.log('L:', left.slice(0, -1).concat([middle_left || left[left.length - 1]]))
  console.log('R:', ([right[0], middle_right || right[1]]).concat(right.slice(2)))
  console.log(total_length)

  // middle_left and middle_right are going to shadow the last element
  // of left and the first element of right
  var on_leaf = !(middle_right && middle_right)
  var offset = on_leaf ? 0 : 1
  var middle_left_index = middle_left ? left_length - 2 : -1
  var middle_right_index = middle_right ? left_length - 1 : -1
  console.log(middle_left_index, middle_right_index)

  for (i = 1, next = left[1]; i < total_length; ++i) {
    node = next
    next = (i === middle_left_index  ? middle_left  :
            i === middle_right_index ? middle_right :
            i  <  (left_length - 1)  ? left[i + 1]  :
            right[i + 2 - left_length])

    console.log(node === middle_right ? 'middle_right' : node === middle_left ? 'middle_left' : '')
    console.log(next === middle_right ? 'middle_right' : next === middle_left ? 'middle_left' : '')
    console.log("node:", node);
    console.log("next:", next);

    // Skip nodes that were emptied in previous step
    if (node.length === offset) {
      continue
    }

    if (node.length < (MIN_ELEMENTS + offset)) {
      diff = ELEMENTS - node.length
      if (on_leaf) {
        // TODO: possible optimisation: if node was modified (thus
        // cloned) in previous step we can avoid concat and use push
        // instead
        node = node.concat(next.slice(0, diff))

        // TODO: possible optimisation: we can avoid this operation if
        // diff >= next.length because it's going to be empty in effect
        // and discarded
        next = next.slice(diff)
      } else {
        node = node.concat(next.slice(1, diff))
        node[0] = []
        put_ranges(node, 0)

        next = [[]].concat(next.slice(diff + 1))
        put_ranges(next, 0)
      }
    }

    console.log("node:", node);
    console.log("next:", next);
    console.log("---");

    (nodes_pushed < ELEMENTS ? new_left : new_right).push(node)
    ++nodes_pushed
  }

  if (next.length > offset) {
    (nodes_pushed < ELEMENTS ? new_left : new_right).push(next)
  }

  put_ranges(new_left, offset)
  put_ranges(new_right, offset)
}

function put_ranges (node, offset) {
  var ranges = node[0]
  var size = 0
  for (var i = 1; i < node.length; ++i) {
    size += node[i].length - offset
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
