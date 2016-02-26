"use strict";

var OakArray = require("./OakArray")

var toArray = require("../slice")

describe("Array", function () {
  describe("get", function () {
    var data, key, array

    beforeEach(function () {
      data = []
      data[27] = []
      data[27][31] = "hello"

      key = (27 << 5) + 31

      array = new OakArray(data, 2)
    })

    it("reaches multi long-keyed data", function () {
      expect(array.get(key)).toBe("hello")
    })

    it("returns undefined for missing element", function () {
      expect(array.get(11111111)).toBeUndefined();
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

  it("forEach executes function for each element", function () {
    var array =
        new OakArray()
        .set(33, "asdf")
        .set(10001, "qwer")

    var expected_calls = [["asdf", 33, array],
                          ["qwer", 10001, array]];
    var calls = [];

    array.forEach(function () {
      calls.push(toArray(arguments))
    })

    expect(calls).toEqual(expected_calls)
  })

  it("map returns modified array", function () {
    var array = OakArray.load([1,2,3]).map(function (x) {
      return x * 2
    });

    expect(array instanceof OakArray)
      .toBe(true, "instanceof OakArray")
    expect(array.length).toBe(3)
    expect(array.get(0)).toBe(2)
    expect(array.get(1)).toBe(4)
    expect(array.get(2)).toBe(6)
  })
})
