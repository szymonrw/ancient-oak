"use strict"

module.exports = AbstractOak

function AbstractOak () {
}

AbstractOak.immortalise = function fallback_immortalise (value) {
  return value
}

AbstractOak.prototype.reduce = function reduce (f, result) {
  this.forEach(function (value, key, all) {
    result = f(result, value, key, all)
  })
  return result
}

AbstractOak.prototype.map = function map (f) {
  return this.reduce(function (result, value, key, all) {
    return result.set(key, f(value, key, all))
  }, this.__new())
}

AbstractOak.prototype.filter = function filter (f) {
  return this.reduce(function (result, value, key, all) {
    return f(value, key, all) ? result.__set(key, value) : result
  }, this.__new())
}
