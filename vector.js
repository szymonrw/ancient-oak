"use strict";

var numbers = function (bits) {
  var width = 1 << bits;
  var mask  = width - 1;

  return {
    neutral: 0,
    divide: function divide_number (key, depth) {
      var parts = new Array(depth);

      for (var shift = (depth - 1) * bits, i = 0;
           shift >= 0;
           shift -= bits, ++i) {
        parts[i] = (key >> shift) & mask;
      }

      return parts;
    },
    min_depth: function min_depth (key) {
      return Math.ceil(Math.log(key + 1) / Math.log(width));
    },
    new_node: function new_number_node () {
      return new Array(width);
    },
    copy: function copy_array (array) {
      return array ? array.concat([]) : new Array(width);
    },
    paritition: function paritition (input) {
      var arrays = [];
      arrays.depth = (input[0].depth || 1) + 1;

      for (var i = 0; i < input.length; i += width) {
        arrays.push(input.slice(i, i + width));
      }

      Object.freeze(arrays);

      return arrays.length <= width ? arrays : paritition(arrays);
    }
  }
};


function store_config (options) {
  var paritition = options.paritition;
  var divide = options.divide;
  var copy = options.copy;
  var new_node = options.new_node;
  var min_depth = options.min_depth;
  var neutral = options.neutral;

  return store;

  function store (input) {
    return input.reduce(function (array, value, key) {
      return array.set(key, value);
    }, api());
  }

  function api (data) {
    lookup.data = data;
    lookup.set = set;

    return lookup;

    function grow (depth) {
      var root = copy(data);
      var levels = depth - (data && data.depth || 1);

      var node;
      for (var i = 0; i < levels; ++i) {
        node = root;
        root = new_node();
        root[neutral] = node;
      }

      root.depth = depth;

      return root;
    }

    function set (key, value) {
      var depth = Math.max(min_depth(key), data && data.depth || 1);

      var key_parts = divide(key, depth);

      var last_key = key_parts.pop();

      var root = grow(depth);

      var i, current_key, parent, node = root;

      for (i = 0; i < key_parts.length; ++i) {
        current_key = key_parts[i];
        parent = node;
        node = copy(node[current_key]);
        parent[current_key] = node;
        Object.freeze(parent);
      }

      node[last_key] = value;

      return api(root);
    }

    function lookup (key) {
      var key_parts = divide(key, data.depth);

      return key_parts.reduce(function (node, key_part) {
        return node && node[key_part];
      }, data);
    }
  }
}

var util = require("util");

function inspect (data) {
  console.log(util.inspect(data, {depth: null, colors: true}));
}

var vector2 = store_config(numbers(2));
var vector3 = store_config(numbers(3));

var alphabet = ["a","b","c","d","e","f","g","h","i","j","k"];

var a = vector2(alphabet);
var b = a.set(123, "z");
var c = b.set(70, "y");
var d = c.set(1023, "x");

console.log(b(123), b(70), b(1023));
console.log(c(123), c(70), c(1023));
console.log(d(123), d(70), d(1023));

console.log("a:");
inspect(a.data);

console.log("b:");
inspect(b.data);

console.log("c:");
inspect(c.data);

console.log("d:");
inspect(d.data);
