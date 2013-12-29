"use strict";

var strings = function (width) {
  return {
    neutral: "",
    divide: function divide_string (key, depth) {
      var parts = new Array(depth);
      var padding = depth - min_depth(key);
      var i, k;
      for (i = 0; i < padding; ++i) {
        parts[i] = "";
      }
      for (k = 0; i < depth; ++i, ++k) {
        parts[i] = key.substr(k * width, width);
      }
      return parts;
    },
    merge: function merge (pre, key) {
      return pre + key;
    },
    min_depth: min_depth,
    new_node: function new_object () {
      return {};
    },
    copy: function copy_object (object) {
      var result = {};
      for (var prop in object) {
        result[prop] = object[prop];
      }
      return result;
    },
    iterate: function iterate (object, fn) {
      for (var prop in object) {
        fn(object[prop], prop, object);
      }
    },
    keys: function keys (object) {
      var keys = [];
      for (var prop in object) {
        keys.push(prop);
      }
      return keys;
    },
    reduce: function reduce_object (object, fn, init) {
      for (var prop in object) {
        init = fn(init, object[prop], prop);
      }
      return init;
    }
  };

  function min_depth (key) {
    return Math.ceil(key.length / width);
  }
}

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
    merge: function merge (pre, key) {
      return (pre << bits) + key;
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
    keys: function keys (array) {
      return array.map(function (_, k) { return k; });
    },
    iterate: function iterate (array, fn) {
      array.forEach(fn);
    },
    reduce: function reduce_array (array, fn, init) {
      return array.reduce(fn, init);
    }
  }
};


function store_config (options) {
  var divide = options.divide;
  var copy = options.copy;
  var new_node = options.new_node;
  var min_depth = options.min_depth;
  var neutral = options.neutral;
  var reduce = options.reduce;

  var iterate = options.iterate;
  var merge = options.merge;

  return store;

  function store (input) {
    return reduce(input, function (array, value, key) {
      return array.set(key, value);
    }, api());
  }

  function api (data, depth) {
    depth = depth || 1;

    lookup.data = data;
    lookup.set = set;
    lookup.depth = depth;
    lookup.forEach = forEach;

    return lookup;

    function lookup (key) {
      var key_parts = divide(key, depth);

      return key_parts.reduce(function (node, key_part) {
        return node && node[key_part];
      }, data);
    }

    function grow (dest_depth) {
      var root = copy(data);
      var levels = dest_depth - depth;

      var node;
      for (var i = 0; i < levels; ++i) {
        node = root;
        root = new_node();
        root[neutral] = node;
      }

      return root;
    }

    function set (key, value) {
      var new_depth = Math.max(min_depth(key), depth);

      var key_parts = divide(key, new_depth);

      var last_key = key_parts.pop();

      var root = grow(new_depth);

      var i, current_key, parent, node = root;

      for (i = 0; i < key_parts.length; ++i) {
        current_key = key_parts[i];
        parent = node;
        node = copy(node[current_key]);
        parent[current_key] = node;
        Object.freeze(parent);
      }

      node[last_key] = value;
      Object.freeze(node);

      return api(root, new_depth);
    }

    function forEach (fn) {
      for_recur(data, neutral, 1, fn);
    }

    function for_recur (node, key_pre, level, fn) {
      var invoke = level === depth;

      iterate(node, function (child, key) {
        var key_full = merge(key_pre, key);
        if (invoke) {
          fn(child, key_full, lookup);
        } else {
          for_recur(child, key_full, level + 1, fn);
        }
      });
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

// console.log("a:");
// inspect(a.data);

// console.log("b:");
// inspect(b.data);

// console.log("c:");
// inspect(c.data);

console.log("d:");
inspect(d);

var hashtable = store_config(strings(3));
var h = hashtable({asdfe: 123, qweruiop: 456}).set("z", 890);

inspect(h);
console.log(h("asdfe"), h("qweruiop"), h(""));

d.forEach(function (val, key) {
  console.log(key, " = ", val);
});

h.forEach(function (val, key) {
  console.log(key, " = ", val);
});
