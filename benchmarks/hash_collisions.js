"use strict";

var hash = require("../lib/types/OakObject").hash
var sqlite = require("co-sqlite3")

var DB = sqlite("./collisions.sqlite3").then(function (db) {
  return db.run(
    "CREATE TABLE pairs (hash TEXT, key TEXT)"
  ).then(function () { return db })
})

var start = "    ";
var end = start.replace(/ /g, "~")

var codes = Array.prototype.slice.apply(start).map(function (x) {
  return x.charCodeAt(0)
})

function next (db, str) {
  return db.run(
    "INSERT INTO pairs (hash, key) VALUES (?, ?)",
    [hash(str).toString(16), str]
  ).then(function () {
    return (str !== end
            ? next(db, inc(str))
            : db)
  })
}

DB.then(function (db) {
  return next(db, start)
}).then(function (db) {
  return db.all("SELECT hash, group_concat(key) AS keys FROM pairs GROUP BY hash HAVING count(hash) > 1")
}).then(function (all) {
  console.log(all)
}).catch(function (error) {
  console.error(error.message)
  console.error(error.stack)
})

function inc () {
  var carry
  for (var i = 0; i < codes.length; ++i) {
    carry = codes[i] > 125
    if (carry) {
      codes[i] = 32
    } else {
      ++codes[i]
      break
    }
  }

  return codes.map(function (x) {
    return String.fromCharCode(x)
  }).join('')
}
