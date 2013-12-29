"use strict";

var strings = function (width) {
  return {
    zero: "",
    split_key: function split_key (key, depth) {
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
    merge_key: function merge_key (pre, key) {
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
    zero: 0,
    split_key: function split_key (key, depth) {
      var parts = new Array(depth);

      for (var shift = (depth - 1) * bits, i = 0;
           shift >= 0;
           shift -= bits, ++i) {
        parts[i] = (key >> shift) & mask;
      }

      return parts;
    },
    merge_key: function merge_key (pre, key) {
      return (pre << bits) + key;
    },
    min_depth: function min_depth (key) {
      return Math.ceil(Math.log(key + 1) / Math.log(width));
    },
    new_node: function new_node () {
      return new Array(width);
    },
    copy: function copy_array (array) {
      return array ? array.concat([]) : new Array(width);
    },
    iterate: function iterate (array, fn) {
      array.forEach(fn);
    }
  }
};


function store_config (options) {
  var split_key = options.split_key;
  var copy = options.copy;
  var new_node = options.new_node;
  var min_depth = options.min_depth;
  var zero = options.zero;

  var iterate = options.iterate;
  var merge_key = options.merge_key;

  return store;

  function store (input) {
    var result = api();

    iterate(input, function (value, key) {
      result = result.set(key, value);
    });

    return result;
  }

  function api (data, depth) {
    depth = depth || 1;

    get.data = data;
    get.depth = depth;

    get.set = set;

    get.forEach = forEach;
    get.reduce = reduce;
    get.map = map;

    Object.freeze(get);

    return get;

    function get (key) {
      var key_parts = split_key(key, depth);

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
        root[zero] = node;
      }

      return root;
    }

    function set (key, value) {
      var new_depth = Math.max(min_depth(key), depth);

      var key_parts = split_key(key, new_depth);

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

    function map (fn) {
      return reduce(function (result, value, key) {
        return result.set(key, fn(value, key, get));
      }, api());
    }

    function reduce (fn, init) {
      var result = init;
      forEach(function (value, key) {
        result = fn(result, value, key, get);
      });
      return result;
    }

    function forEach (fn) {
      for_recur(data, zero, 1, fn);
    }

    function for_recur (node, key_pre, level, fn) {
      var invoke = level === depth;

      iterate(node, function (child, key) {
        var key_full = merge_key(key_pre, key);
        if (invoke) {
          fn(child, key_full, get);
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
