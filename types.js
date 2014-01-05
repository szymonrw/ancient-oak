"use strict";

var array = require("./lib/types/array")(4);
var hash = require("./lib/types/hash")(2);

function p (a) {
  console.log("--- length: ", a.size);
  a.forEach(function (v, k) { console.log(k, v); });
}

var a = array([6,7,8,9]);
var b = hash({asdf: 123, qwer: 456});

p(a);
p(b);
p(a.map(function (v) { return v + 100 }));
p(a.set(100, "asdf"));
console.log("last", a.set(100, "asdf").pop().last());
p(a.push(10));
