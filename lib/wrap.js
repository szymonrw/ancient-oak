"use strict";

module.exports = wrap;

wrap.all = wrap_all;

function wrap (api, value) {
  return (typeof value === "function"
          ? decorate
          : value);

  function decorate () {
    console.log("decorating", value);
    var result = value.apply(null, arguments);
    return (result && result.immutable_api
            ? api(result)
            : result);
  }
}

function wrap_all (from, to, api) {
  for (var name in from) {
    to[name] = wrap(api, from[name]);
  }
}
