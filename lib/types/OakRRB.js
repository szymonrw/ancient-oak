"use strict"

var KEY_BITS = 2
var ELEMENTS = 1 << KEY_BITS

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

    index -= (i > 0  ? node[0][i - 1] : 0)
    node = node[i + 1]
  }

  return node[index]
}

;(function test () {
  var a = new OakArray([[9,15],

                        [[3,7,9],
                         [1,2,3], [4,5,6,7], [8,9]],

                        [[3,4,6],
                         [10,11,12], [13], [14,15]]],
                       3);

  for (var i = 0; i < 15; ++i) {
    console.log(i, a.get(i))
  }
})();
