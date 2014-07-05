"use strict";

var store = require("../lib");

describe("store", function () {
  it("stores nulls as nulls", function () {
    expect(store(null)).toBe(null);
  });

  it("stores undefined as undefined", function () {
    expect(store(undefined)).toBe(undefined);
  });

  it("stores booleans as booleans", function () {
    var value1 = true;
    var value2 = false;
    expect(store(false)).toBe(false);
    expect(store(true)).toBe(true);
  });

  it("stores numbers as numbers", function () {
    var value = 123;
    expect(store(value)).toBe(value);
  });

  it("stores strings as strings", function () {
    var value = "asdf";
    expect(store(value)).toBe(value);
  });

  it("stores function as functions", function () {
    var value = function () {};
    expect(store(value)).toBe(value);
  });
});
