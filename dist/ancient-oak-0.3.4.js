!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.I=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";

module.exports = numbers_keys;

function numbers_keys (bits) {
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
    new_dump: function new_dump () {
      return [];
    },
    copy: function copy_array (array) {
      return array ? array.concat([]) : new Array(width);
    },
    iterate: function iterate (array, fn) {
      if (array) {
        array.forEach(fn);
      }
    }
  }
};

},{}],2:[function(_dereq_,module,exports){
"use strict";

module.exports = storage;

var slice = _dereq_("../slice");

function pass (value) {
  return value;
}

function storage (options) {
  var split_key = options.keys.split_key;
  var merge_key = options.keys.merge_key;

  var copy = options.keys.copy;
  var new_node = options.keys.new_node;
  var new_dump = options.keys.new_dump;
  var min_depth = options.keys.min_depth;
  var zero = options.keys.zero;

  var iterate = options.keys.iterate;

  var store = options.store;
  var immutable = store.immutable;
  var extend = options.extend || function () {};
  var calc_props = options.props || function () {};

  create.is_it = options.is_it;

  Object.freeze(create);

  return create;

  function create (input) {
    var result = api();

    iterate(input, function (value, key) {
      result = result.set(key, store(value));
    });

    return result;
  }

  function api (data, depth, props) {
    depth = depth || 1;
    props = props || {};

    var set = modifier({
      name: "set",
      descending: copy,
      leaf: set_value,
      ascending: set_child
    });

    var update = modifier({
      name: "update",
      descending: copy,
      leaf: process_value,
      ascending: set_child
    });

    var modify_patch = modifier({
      name: "patch",
      descending: copy,
      leaf: patch_value,
      ascending: set_child
    });

    var modify_rm = modifier({
      name: "rm",
      descending: copy_only_existing,
      leaf: delete_key,
      ascending: set_child
    });

    get.data = data;
    get.depth = depth;

    get.dump = dump;
    get.json = json;

    // TODO: deepset!

    get.set = set;
    get.update = update;
    get.patch = patch;
    get.rm = rm;

    get.forEach = forEach;
    get.reduce = reduce;
    get.map = map;
    get.filter = filter;

    extend(get, store);

    for (var name in props) {
      get[name] = props[name];
    }

    Object.freeze(get);

    return get;

    function get (key) {
      var key_depth = min_depth(key);
      // The tree never stored keys that big, nothing to return;
      if (key_depth > depth) return;

      var key_parts = split_key(key, depth);

      return key_parts.reduce(function (node, key_part) {
        return node && node[key_part];
      }, data);
    }

    function dump () {
      return reduce(function (result, value, key) {
        value = (value && typeof value.dump === "function"
                 ? value.dump()
                 : value);

        result[key] = value;
        return result;
      }, new_dump());
    }

    function json () {
      return JSON.stringify(dump());
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

    function shrink (root, old_depth, new_props) {
      var elements = 0;
      iterate(root, function () {
        ++elements;
      });

      return ((elements === 1 && old_depth > 1 && zero in root)
              // We have only one element with neutral key and we can
              // decrease the depth
              ? shrink(root[zero], old_depth - 1, new_props)
              : elements === 0
              // We have no elements, we can return empty collection
              ? api()
              // We have more than one element, we cannot decrease depth
              : api(root, old_depth, new_props));
    }

    function patch (name, value) {
      if (typeof name === "object") {
        // TODO: support diffs as immutable structures
        var diff = name;
        var result = get;
        for (name in diff) {
          result = result.patch(name, diff[name]);
        }
        return result;
      } else {
        return modify_patch(name, value);
      }

      return result;
    }

    function rm (key) {
      if (arguments.length > 1) {
        var subargs = slice(arguments, 1);
        return update(key, function (node) {
          return node.rm.apply(null, subargs);
        });
      }

      var key_depth = min_depth(key);

      // The tree never stored keys that big, nothing to delete.
      if (key_depth > depth) return get;

      return modify_rm(key);
    }

    function modifier (actions) {
      var name = actions.name;
      var descending_action = actions.descending;
      var leaf_action = actions.leaf;
      var ascending_action = actions.ascending;

      return function modify (key, value) {
        var new_depth = Math.max(min_depth(key), depth);
        var key_parts = split_key(key, new_depth);
        var length = new_depth - 1;

        var root = grow(new_depth);

        var i, parent;
        var path = new Array(length);
        var node = root;

        // descending
        for (i = 0; i < length; ++i)  {
          path[i] = node;
          node = descending_action(node[key_parts[i]]);
        }

        leaf_action(node, key_parts[i], value);

        Object.freeze(node);

        // ascending
        for (i = length - 1; i >= 0; --i) {
          parent = path[i];
          ascending_action(parent, key_parts[i], node);
          node = parent;
          Object.freeze(parent);
        }

        var new_props = calc_props(props, name, key);

        return shrink(root, new_depth, new_props);
      }
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

    function filter (fn) {
      return reduce(function (result, value, key) {
        return (fn(value, key)
                ? result.set(key, value)
                : result);
      }, api());
    }

    function forEach (fn) {
      for_recur(data, zero, 1, fn);
      return get;
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

  function set_value (node, key_part, value) {
    node[key_part] = store(value);
  }

  function process_value (node, key_part, fn) {
    node[key_part] = store(fn(node[key_part]));
  }

  function patch_value (node, key_part, value) {
    var old = node[key_part];

    if (immutable(value)) {
      old = store(value);
    } else if (old && old.patch) {
      old = old.patch(value);
    } else {
      old = store(value);
    }

    node[key_part] = old;
  }

  function is_empty (node) {
    if (!node) return true;

    var empty = true;
    iterate(node, function () {
      empty = false;
    });
    return empty;
  }
}

},{"../slice":5}],3:[function(_dereq_,module,exports){
"use strict";

module.exports = string_keys;

function string_keys (width) {
  return {
    zero: "",
    split_key: function split_key (key, depth) {
      key = key.toString();
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
    new_node: new_object,
    new_dump: new_object,
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

  function new_object () {
    return {};
  }

  function min_depth (key) {
    return Math.ceil(key.toString().length / width);
  }
}

},{}],4:[function(_dereq_,module,exports){
"use strict";

var ARRAY_KEY_BITS = 5;
var HASH_KEY_WIDTH = 2;

store.immutable = immutable;

module.exports = store;

var storages = [
  _dereq_("./types/primitive"),
  _dereq_("./types/date"),
  _dereq_("./types/array")(ARRAY_KEY_BITS, store),
  _dereq_("./types/object")(HASH_KEY_WIDTH, store)
];

// Find first storage that returns is_it() === true
function storage_for (value) {
  var i;
  var length = storages.length;

  for (i = 0;
       i < length && !storages[i].is_it(value);
       ++i);

  return (i < length
          ? storages[i]
          : null);
}

function immutable (value) {
  return !storage_for(value);
}

function store (value) {
  var storage = storage_for(value);

  return (storage
          ? storage(value)
          : value);
}

},{"./types/array":6,"./types/date":7,"./types/object":8,"./types/primitive":9}],5:[function(_dereq_,module,exports){
"use strict";

module.exports = slice;

var _slice = Array.prototype.slice;

function slice (array, begin, end) {
  return _slice.call(array, begin, end);
}

},{}],6:[function(_dereq_,module,exports){
"use strict";

module.exports = array_storage_config;

function array_storage_config (bits, store) {
  var number_keys = _dereq_("../balanced_storage/sorted_number_keys");
  var storage = _dereq_("../balanced_storage/storage");

  return storage({
    keys: number_keys(bits),
    is_it: is_it,
    store: store,
    extend: extend,
    props: props
  });
}

function is_it (value) {
  return value instanceof Array;
}

function props (old_props, action, key) {
  var size = old_props.size || 0;
  if (typeof key === "string") {
    key = parseInt(key, 10);
  }

  size = Math.max(size, key + 1);

  return { size: size };
}

function extend (api, store) {
  api.push = push;
  api.pop = pop;
  api.filter = filter;
  api.slice = slice;

  api.size = 0;

  function push (value) {
    return api.set(api.size, value);
  }

  function filter (fn) {
    return api.reduce(function (result, value, key) {
      return (fn(value, key)
              ? result.push(value)
              : result);
    }, store([]));
  }

  function slice (start, end) {
    if (arguments.length === 1) {
      end = api.size;
    } else if (end < 0) {
      end = api.size + end;
    }

    return api.filter(function (_, key) {
      return key >= start && key < end;
    });
  }

  function pop () {
    return slice(0, -1);
  }

  // TODO:
  // - last
  // - concat
  // - join
  // - shift
}

},{"../balanced_storage/sorted_number_keys":1,"../balanced_storage/storage":2}],7:[function(_dereq_,module,exports){
"use strict";

store.is_it = is_it;

module.exports = store;

var slice = _dereq_("../slice");

function is_it (value) {
  return value instanceof Date;
}

function store (date) {
  var value = date.valueOf();
  date = null; // allow the input value to be GC'd

  get.value = value;
  get.dump = dump;
  get.json = json;
  get.set = set;
  get.update = update;
  get.patch = patch;

  Object.freeze(get);

  return get;

  function get (field) {
    // recreate date object and cache it
    if (!date) date = dump();

    var method = "get" + camel_case(field);

    return date[method]();
  }

  function set (field) {
    var method = "set" + camel_case(field);
    var args = slice(arguments, 1);

    var new_date = dump();
    new_date[method].apply(new_date, args);

    return store(new_date);
  }

  function update (field, modify) {
    var prop = camel_case(field);
    var set_method = "set" + prop;
    var get_method = "get" + prop;

    var new_date = dump();

    var field_value = modify(new_date[get_method]());
    new_date[set_method](field_value);

    return store(new_date);
  }

  function patch (fields) {
    var new_date = dump();

    Object.keys(fields).forEach(function (field) {
      var method = "set" + camel_case(field);
      var value = fields[field];
      new_date[method](value);
    });

    return store(new_date);
  }

  function dump () {
    return new Date(value);
  }

  function json () {
    return JSON.stringify(dump());
  }

  function camel_case (field) {
    return field.replace(/utc|_.|^./g, function (str) {
      return str.toUpperCase();
    }).replace(/_/g, "");
  }
}

},{"../slice":5}],8:[function(_dereq_,module,exports){
"use strict";

module.exports = hash_storage_config;

function hash_storage_config (width, store) {
  var string_keys = _dereq_("../balanced_storage/string_keys");
  var storage = _dereq_("../balanced_storage/storage");

  return storage({
    keys: string_keys(width),
    is_it: is_it,
    store: store
  });
}

function is_it (value) {
  return typeof value === "object";
}

},{"../balanced_storage/storage":2,"../balanced_storage/string_keys":3}],9:[function(_dereq_,module,exports){
"use strict";

module.exports = storage;

storage.is_it = is_it;

function storage (value) {
  return value;
}

function is_it (value) {
  return value === null || value === undefined || typeof value !== "object";
}

},{}]},{},[4])
(4)
});