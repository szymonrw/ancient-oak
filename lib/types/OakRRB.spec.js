"use strict"

var OakArray = require("./OakRRB")

describe("OakArray", function () {
  describe("set", function () {
    it("for empty array sets elements on the tail", function () {
      var a = new OakArray().set(0, "asdf")
      expect(a.data).toEqual([])
      expect(a.tail[0]).toEqual("asdf")
    })

    it("merges tail to data when the tail exceeds capacity", function () {
      var a = new OakArray()
      var b = a.set(31, "asdf")
      var c = b.set(32, "qwer")

      expect(b.length).toBe(32)
      expect(b.data_length).toBe(0)
      expect(b.tail[31]).toBe("asdf")

      expect(c.length).toBe(33)
      expect(c.data_length).toBe(32)
      expect(c.data[31]).toBe("asdf")
      expect(c.tail[0]).toBe("qwer")

      // console.log(a)
      // console.log(b)
      // console.log(c)
      // console.log(c.data.length)

    })

    it("creates vastly sparse arrays", function () {
      var a = new OakArray([1,2,3], 1, 3)
      var b = a.set(31, "qwer")
          .set(8000, "asdf")
          //.set(7000, "zxcv")
          //.set(1600, "zxcv")
      //var c = b.set(31, "qwer")
      console.log(b)

      //console.log(c)
    })
  })
})
