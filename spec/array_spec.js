"use strict";

var OakArray = require("../lib/types/array")

describe("Array", function () {
  describe("get", function () {
    it("reaches multi long-keyed data", function () {
      var data = []
      data[27] = []
      data[27][31] = "hello"

      var key = (27 << 5) + 31

      var array = new OakArray(data, 2)
      expect(array.get(key)).toBe("hello")
    })
  })

  describe("push", function () {
    it("increases length", function () {
      var v1 = new OakArray()
      var v2 = v1.push(v1)
    })
  })

  describe("set", function () {
    var data, key, array

    beforeEach(function () {
      data = [[[]]]
      data[27] = []
      data[27][31] = []
      data[27][31][13] = "hello"

      key = (27 << 10) + (31 << 5) + 13
      array = new OakArray().set(key, "hello")
    })

    it("sets the value", function () {
      expect(array.get(key)).toBe("hello")
    })

    it("sets length to key+1", function () {
      expect(array.length).toBe(key + 1)
    })

    it("grows data for long keys", function () {
      expect(array.depth).toBe(3);
    })

    it("maintains balanced tree", function () {
      expect(array.data).toEqual(data)
    })
  })
})
