"use strict"

var OakObject = require("../lib/types/object")

describe("OakObject", function () {
  it("sets and gets value", function () {
    var obj = new OakObject()
    expect(obj.set("asdf", "qwer").get("asdf")).toBe("qwer")
  })

  it("get returns undefined for wrong key", function () {
    var obj = new OakObject()
    expect(obj.get("asdf")).toBeUndefined()
  })
})
