"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 8;

module.exports = immortalise;

var OakArray = require('./types/array')
var OakObject = require('./types/object')
var OakDate = require('./types/date')

function immortalise (value) {
  return (isImmutable(value) ? value :
          isArray(value) ? OakArray.load(value) :
          isDate(value) ? new OakDate(value) :
          OakObject.load(value));
}

function isImmutable (value) {
  return (isPrimitive(value) ||
          value instanceof OakArray ||
          value instanceof OakObject ||
          value instanceof OakDate)
}

function isPrimitive (value) {
  return value === null || value === undefined || typeof value !== "object";
}

function isArray (value) {
  return value instanceof Array
}

function isDate (value) {
  return value instanceof Date
}
