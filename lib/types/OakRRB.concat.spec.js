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
})
