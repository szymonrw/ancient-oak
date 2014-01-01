"use strict";

var store_config = require("./lib/balanced_storage/storage.js");
var numbers = require("./lib/balanced_storage/sorted_number_keys");
var strings = require("./lib/balanced_storage/string_keys");


var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

var vector2 = store_config(numbers(2));
var vector3 = store_config(numbers(3));

var alphabet = ["a","b","c","d","e","f","g","h","i","j","k"];

var a = vector2(alphabet);
var b = a.set(123, "y");
var c = b.set(70, "x");
var d = c.set(1023, "z");

console.log(b(123), b(70), b(1023));
console.log(c(123), c(70), c(1023));
console.log(d(123), d(70), d(1023));

// console.log("a:");
// inspect(a.data);

// console.log("b:");
// inspect(b.data);

// console.log("c:");
// inspect(c.data);

console.log("d:");
inspect(d);
inspect(d.map(function (val) { return val + "!" }));

var hashtable = store_config(strings(3));
var h = hashtable({asdfe: 123, qweruiop: 456}).set("z", 890);

inspect(h);
inspect(h.map(function (val) {
  return val * 1000;
}));

console.log(h("asdfe"), h("qweruiop"), h(""));

d.forEach(function (val, key) {
  console.log(key, " = ", val);
});

h.forEach(function (val, key) {
  console.log(key, " = ", val);
});

var u = vector2([1,2,3]);
var u1 = u.set(100, "asdf").set(101, "qwer");
var u2 = u1.rm(100).rm(101);

inspect(u.data);
inspect(u1.data);
inspect(u2.data);
