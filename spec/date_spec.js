"use strict";

var store = require("../lib");

describe("store", function () {

  describe("stored date", function () {
    var date = new Date();
    var result = store(date)();

    it("is the same value as original", function () {
      expect(result).toEqual(date);
    });

    it("is not the same object as original", function () {
      expect(result).not.toBe(date);
    });
  });

  describe("implements dumping", function () {
    var date = store(new Date());

    it("with dump method", function () {
      expect(date.dump()).toEqual(date());
    });

    it("with json method", function () {
      expect(date.json()).toEqual(JSON.stringify(date()));
    });
  });
});
