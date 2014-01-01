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
  var merge_key = options.merge_key;

  var copy = options.copy;
  var new_node = options.new_node;
  var min_depth = options.min_depth;
  var zero = options.zero;

  var iterate = options.iterate;

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
    get.rm = rm;

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

    function shrink (root, old_depth) {
      var elements = 0;
      iterate(root, function () {
        ++elements;
      });

      return ((elements === 1 && old_depth > 1 && zero in root)
              // We have only one element with neutral key and we can
              // decrease the depth
              ? shrink(root[zero], old_depth - 1)
              : elements === 0
              // We have no element, we can return empty collection
              ? api()
              // We have more than one element, we cannot decrease depth
              : api(root, old_depth));
    }

    function set (key, value) {
      return modify(key, copy, set_value, set_child);

      function set_value (node, key_part) {
        node[key_part] = value;
      }

      function set_child (parent, key_part, node) {
        parent[key_part] = node;
      }
    }

    function rm (key) {
      var key_depth = min_depth(key);

      // The tree never stored keys that big, nothing to delete.
      if (key_depth > depth) return get;

      return modify(key, copy_only_existing, delete_key, set_child);

      function copy_only_existing (node) {
        return node ? copy(node) : null
      }

      function delete_key (node, key_part) {
        if (node) delete node[key_part];
      }

      function set_child (parent, key_part, child) {
        if (!parent) return;

        if (is_empty(child)) {
          delete parent[key_part];
        } else {
          parent[key_part] = child;
        }
      }
    }

    function is_empty (node) {
      if (!node) return true;

      var empty = true;
      iterate(node, function () {
        empty = false;
      });
      return empty;
    }

    function modify (key, descending_action, leaf_action, ascending_action) {
      var new_depth = Math.max(min_depth(key), depth);
      var key_parts = split_key(key, new_depth);
      var root = grow(new_depth);

      var length = new_depth - 1;

      var path = new Array(length);
      var i, parent;

      var node = root;

      // descending
      for (i = 0; i < length; ++i)  {
        path[i] = node;
        node = descending_action(node[key_parts[i]]);
      }

      leaf_action(node, key_parts[i]);

      //node[key_parts[i]] = value;
      Object.freeze(node);

      // ascending
      for (i = length - 1; i >= 0; --i) {
        parent = path[i];
        ascending_action(parent, key_parts[i], node);
        node = parent;
        Object.freeze(parent);
      }

      return shrink(root, new_depth);
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
