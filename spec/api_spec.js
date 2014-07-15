"use strict";

var store = require("../lib");

describe("api", function () {
  describe(".dump and .json", function () {
    var plain = { a: 1, b: [ 2, 3 ] };
    var data = store(plain);

    it(".dump returns same tree", function () {
      expect(data.dump()).toEqual(plain);
    });

    it("return equivalent output", function () {
      expect(JSON.parse(data.json())).toEqual(data.dump());
    });
  });

  describe("the getter", function () {
    it("returns value for a given key", function () {
      var ab = store({ a: 1, b: 2 });
      var array = store([ 1, 2 ]);

      expect(ab("a")).toEqual(1);
      expect(ab("b")).toEqual(2);
      expect(array(0)).toEqual(1);
      expect(array(1)).toEqual(2);
    });

    it("returns undefined for non-existing keys", function () {
      expect(store({ a: 1 })("b")).toBeUndefined();
    });

    it("returns subtree for a given key", function () {
      var a = store({ a: { b: 2, c: 3 }, d: 4 })("a");
      expect(typeof a).toBe("function");
      expect(a.dump()).toEqual({ b: 2, c: 3 });
    });
  });

  describe(".set", function () {
    it("returns a new version", function () {
      var v0 = store({ a: 1 });
      var v1 = v0.set("a", 2);
      expect(v1).not.toBe(v0);
    });

    it("overwrites existing values", function () {
      expect(store({ a: 1 }).set("a", 2).dump()).toEqual({ a: 2 });
      expect(store([1]).set(0, 2).dump()).toEqual([2]);
    });

    it("adds new values", function () {
      expect(store({ a: 1 }).set("b", 2).dump()).toEqual({ a: 1, b: 2 });
      expect(store([1]).set(1, 2).dump()).toEqual([1, 2]);
    });

    it("increases size of an array", function () {
      var v0 = store([1]);
      var v1 = v0.set(2, 1);
      expect(v0.size).toBe(1);
      expect(v1.size).toBe(3);
    });
  });

  describe(".update", function () {
    it("returns a new version", function () {
      var v0 = store({ a: 1 });
      var v1 = v0.update("a", function () {});
      expect(v1).not.toBe(v0);
    });

    it("passes existing value to the passed function", function () {
      var value;
      var v0 = store({ a: 1 }).update("a", function (v) {
        value = v;
      });
      expect(value).toBe(1);
    });

    it("passes undefined to the function for a new key", function () {
      var value = 123; // init value so we know it was set to undefined
      var v0 = store({ a: 1 }).update("b", function (v) {
        value = v;
      });
      expect(value).toBeUndefined();
    });

    it("sets the value to the result of the function", function () {
      expect(store({ a: 1 }).update("a", function (v) {
        return v + 1;
      })("a")).toBe(2);
    });

    it("set the value for a new key", function () {
      expect(store({ a: 1 }).update("b", function () {
        return 2;
      })("b")).toBe(2);
    });

    it("increases size of an array", function () {
      var v0 = store([1]);
      var v1 = v0.update(2, function () {});
      expect(v0.size).toBe(1);
      expect(v1.size).toBe(3);
    });
  });

  describe(".filter", function () {
    it("filters objects", function () {
      var v0 = store({ a: 1, b: 2, c: 3, d: 4 });
      var v1 = v0.filter(function (value) {
        return value % 2 === 0;
      });
      var v2 = v0.filter(function (_, key) {
        return key === "a" || key === "c";
      });

      expect(v1.dump()).toEqual({ b: 2, d: 4 });
      expect(v2.dump()).toEqual({ a: 1, c: 3 });
    });

    it("filters arrays", function () {
      var v0 = store([1, 2, 3, 4]);
      var v1 = v0.filter(function (value) {
        return value % 2 === 0;
      });
      var v2 = v0.filter(function (_, key) {
        return key % 2 === 0;
      });

      expect(v1.dump()).toEqual([2, 4]);
      expect(v2.dump()).toEqual([1, 3]);
    });
  });
});
