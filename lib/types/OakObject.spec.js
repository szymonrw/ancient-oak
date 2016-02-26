"use strict"

var OakObject = require("./OakObject")
var toArray = require("../slice")

describe("OakObject", function () {
  it("sets and gets value", function () {
    var obj = new OakObject()
    expect(obj.set("asdf", "qwer").get("asdf")).toBe("qwer")
  })

  it("get returns undefined for wrong key", function () {
    var obj = new OakObject()
    expect(obj.get("asdf")).toBeUndefined()
  })

  it("forEach executes function for each element", function () {
    var obj = OakObject.load({
      asdf: 123,
      qwer: 456
    })

    var expected_calls = {
      asdf: [123, "asdf", obj],
      qwer: [456, "qwer", obj]
    }

    var calls = {};

    obj.forEach(function (value, key) {
      calls[key] = toArray(arguments)
    })

    expect(calls).toEqual(expected_calls)
  })

  it("map returns modified object", function () {
    var array = OakObject.load({a: 1, b: 2, c: 3}).map(function (x) {
      return x * 2
    });

    expect(array instanceof OakObject)
      .toBe(true, "instanceof OakObject")
    expect(array.get("a")).toBe(2)
    expect(array.get("b")).toBe(4)
    expect(array.get("c")).toBe(6)
  })
})
