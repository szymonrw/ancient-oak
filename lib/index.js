"use strict"

module.exports = immortalise

var OakObject = require("./types/OakObject")
var OakArray = require("./types/OakArray")
var OakDate = require("./types/OakDate")

var AbstractOak = require("./types/AbstractOak")

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
          value instanceof AbstractOak)
}
