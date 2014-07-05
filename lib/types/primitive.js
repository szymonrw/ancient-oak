"use strict";

module.exports = storage;

storage.is_it = is_it;

function storage (value) {
  return value;
}

function is_it (value) {
  return value === null || value === undefined || typeof value !== "object";
}
