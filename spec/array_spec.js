"use strict";

var store = require("../lib");

describe("arrays", function () {
  it("pushes", function () {
    var v0 = store([1, 2, 3]);
    var v1 = v0.push(4);
    expect(v1.size).toBe(4);
    expect(v1.dump()).toEqual([1, 2, 3, 4]);
  });

  it("pops", function () {
    var v0 = store([1, 2, 3]);
    var v1 = v0.pop();
    var v2 = v1.pop();

    expect(v1.size).toBe(2);
    expect(v2.size).toBe(1);
    expect(v1.dump()).toEqual([1, 2]);
    expect(v2.dump()).toEqual([1]);
  });

  it("slices without end", function () {
    var v0 = store([1, 2, 3, 4]);
    var v1 = v0.slice(0);
    var v2 = v0.slice(1);
    var v3 = v0.slice(2);

    expect(v1.size).toBe(v0.size);
    expect(v2.size).toBe(v0.size - 1);
    expect(v3.size).toBe(v0.size - 2);
    expect(v1.dump()).toEqual(v0.dump());
    expect(v2.dump()).toEqual([2, 3, 4]);
    expect(v3.dump()).toEqual([3, 4]);
  });

  it("slices with positive end", function () {
    var v0 = store([1, 2, 3, 4]);
    var v1 = v0.slice(1, 3);

    expect(v1.size).toEqual(2);
    expect(v1.dump()).toEqual([2, 3]);
  });

  it("slices with negative end", function () {
    var v0 = store([1, 2, 3, 4]);
    var v1 = v0.slice(1, -1);
    var v2 = v0.slice(0, -2);

    expect(v1.size).toEqual(2);
    expect(v2.size).toEqual(2);

    expect(v1.dump()).toEqual([2, 3]);
    expect(v2.dump()).toEqual([1, 2]);
  });

});
