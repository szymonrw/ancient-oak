"use strict";

module.exports = OakDate;

var slice = require("../slice");

function OakDate (date) {
  this.value = date.valueOf();
}

OakDate.prototype.dump = function dump () {
  return new Date(this.value)
}

OakDate.prototype.json = function json () {
  return JSON.stringify(this.dump())
}

OakDate.prototype.get = function get (field) {
  var method = "get" + camel_case(field);

  return this.dump()[method]();
}

OakDate.prototype.set = function set (field) {
  var method = "set" + camel_case(field)
  var args = slice(arguments, 1)

  var date = this.dump()
  date[method].apply(date, args)

  return new OakDate(date)
}

OakDate.prototype.update = function update (field, modify) {
  var prop = camel_case(field)
  var set_method = "set" + prop
  var get_method = "get" + prop

  var date = this.dump()

  var value = modify(date[get_method]())
  date[set_method](value)

  return new OakDate(date);
}

OakDate.prototype.patch = function patch (fields) {
  var date = this.dump()

  Object.keys(fields).forEach(function (field) {
    var method = "set" + camel_case(field)
    var value = fields[field]
    date[method](value)
  })

  return new OakDate(date)
}

function camel_case (field) {
  return field.replace(/utc|_.|^./g, function (str) {
    return str.toUpperCase();
  }).replace(/_/g, "");
}
