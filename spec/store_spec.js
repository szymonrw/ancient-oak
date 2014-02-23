"use strict";

var store = require("../lib");

describe("store", function () {
  describe("given an empty array", function () {
    it(".dump() returns an empty array", function () {
      var result = store([]).dump();
      expect(result instanceof Array).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe("given an example array", function () {
    it(".dump() returns identical array", function () {
      expect(store([1, 2]).dump()).toEqual([1, 2]);
    });
  });

  describe("given an empty object", function () {
    it(".dump() gives back an empty object", function () {
      var result = store({}).dump();
      expect(result instanceof Object).toBe(true);
      expect(result instanceof Array).toBe(false);
      expect(Object.keys(result).length).toBe(0);
    });
  });

  describe("given an example object", function () {
    it(".dump() gives back identical object", function () {
      expect(store({ a: 1, b: 2 }).dump()).toEqual({ a: 1, b: 2 });
    });
  });

  describe("given an object inside of an array", function () {
    it("immortalizes that object", function () {
      var result = store([{ a: 1 }])(0).dump();
      expect(result).toEqual({a: 1});
      expect(result instanceof Array).toBe(false);
    });
  });

  describe("given an array inside of an object", function () {
    it("immortalizes that array", function () {
      var result = store({ a: [1] })("a").dump();
      expect(result).toEqual([1]);
      expect(result instanceof Array).toBe(true);
    });
  });

  describe("given a primitive", function () {
    it("returns that primitive", function () {
      expect(store(1)).toBe(1);
      expect(store(true)).toBe(true);
      expect(store(false)).toBe(false);
      expect(store("asdf")).toBe("asdf");
    });
  });
});
