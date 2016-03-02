"use strict"

var AbstractOak = require("./AbstractOak")

describe("AbstractOak", function () {
  it("has fallback immortalise noop static function", function () {
    expect(AbstractOak.immortalise("asdf")).toBe("asdf")
  })
})
