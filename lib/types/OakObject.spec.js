"use strict"

var OakObject = require("./OakObject")
var toArray = require("../slice")

describe("OakObject", function () {
  it("sets and gets value", function () {
    var obj = new OakObject()
    expect(obj.set("asdf", "qwer").get("asdf")).toBe("qwer")
  })

  it("set doesn't change the old version", function () {
    var old = new OakObject()
    var obj = old.set("asdf", "qwer")
    expect(obj.get("asdf")).toBe("qwer")
    expect(old.get("asdf")).toBeUndefined()
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
    var obj = OakObject.load({a: 1, b: 2, c: 3}).map(function (x) {
      return x * 2
    });

    expect(obj instanceof OakObject)
      .toBe(true, "instanceof OakObject")
    expect(obj.get("a")).toBe(2)
    expect(obj.get("b")).toBe(4)
    expect(obj.get("c")).toBe(6)
  })

  it("filter filters", function () {
    var obj = OakObject.load({a: 1, b: 2, c: 3, d: 4}).filter(function (x) {
      return x % 2 === 0
    })

    expect(obj instanceof OakObject)
      .toBe(true, "instanceof OakObject")
    expect(obj.get("b")).toBe(2, "b")
    expect(obj.get("d")).toBe(4, "d")
  })

  describe("update", function () {
    it("creates new field", function () {
      var old = OakObject.load({a: 1})
      var obj = old.update("b", function (value, key) {
        return key + key
      })

      expect(obj instanceof OakObject)
        .toBe(true, "instanceof OakObject")
      expect(obj.get("b")).toBe("bb")
    })
  })
})
