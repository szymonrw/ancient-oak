"use strict"

module.exports = AbstractOak

function AbstractOak () {
}

AbstractOak.prototype.map = function map (f) {
  var result = this.ll_new()

  this.forEach(function (value, key, all) {
    result = result.set(key, f(value, key, all))
  })

  return result
}

AbstractOak.prototype.reduce = function reduce (f, result) {
  //this.forEach(function (value, key,
  return result
}
