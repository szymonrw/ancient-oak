"use strict"

var OakArray = require("./OakRRB")

describe("OakArray.concat", function () {
  // when depth 1, resulting depth 1
  // when depth 1, resulting depth 2 (growing)

  // when depth 2, resulting depth 2
  // when depth 2, resulting depth 1 (shrinking)


  // (We need to test at least 3 levels to make sure that carry-over
  // edge nodes from previous step are used in next step as right-most
  // element from the left array and left-most element from right
  // array, the middle_left and middle_right arguments)

  // when depth 3 and 2
  // when depth 2 and 3

  // Balancing algorithm tests (only two-level)

  describe("balancing", function () {
    var a, b, c

    afterEach(function () {
      var array_a = new OakArray(apply_amounts(a), 2)
      var array_b = new OakArray(apply_amounts(b), 2)
      var array_c = array_a.concat(array_b)
      expect(count_nodes(array_c))
        .toEqual(c)
    })

    it("doesn't balance if all nodes are 31 elements", function () {
      // 4 - floor((31 * 4) / 32) = 1
      a = [31, 31]
      b = [31, 31]
      c = [31, 31, 31, 31]
    })

    it("skips empty nodes", function () {
      a = [32, 0, 32, 0]
      b = [0, 32, 0, 0, 32, 0, 0]
      c = [32, 32, 32, 32]
    })

    it ("balances neighbouring non-empty nodes", function () {
      a = [32, 8, 8, 0, 8, 5]
      b = [32]
      c = [32, 29, 32]
    })
  })
})

function apply_amounts (amounts) {
  var i = 0
  var root = [amounts]

  amounts.forEach(function (amount) {
    var node = []
    while (amount--) {
      node.push(i)
      ++i
    }
    root.push(node)
  })

  return root
}

function count_nodes (array) {
  return array.data.slice(1).map(function (leaf) {
    return leaf.length
  })
}
