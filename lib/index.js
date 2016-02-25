"use strict"

module.exports = immortalise

var OakObject = require("./types/object")
var OakArray = require("./types/array")
var OakDate = require("./types/date")

OakObject.immortalise = immortalise
OakArray.immortalise = immortalise

function immortalise (value) {
  return (isImmutable(value)     ? value                :
          value instanceof Array ? OakArray.load(value) :
          value instanceof Date  ? new OakDate(value)   :
          OakObject.load(value));
}

function isImmutable (value) {
  return (typeof value !== "object"  ||
          value === null             ||
          value === undefined        ||
          value instanceof OakArray  ||
          value instanceof OakObject ||
          value instanceof OakDate)
}
