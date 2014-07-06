"use strict";

var store = require("../lib");

describe("store", function () {
  describe("when setting a key that's a number", function () {
    it("converts it to string", function () {
      var v = store({}).set(123, 456);
      expect(v(123)).toBe(456);
      expect(v("123")).toBe(456);
    });
  });
});
