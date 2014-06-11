"use strict";

module.exports = storage;

function pass (value) {
  return value;
}

var slice = (function () {
  var _slice = Array.prototype.slice;
  return function slice (array, begin, end) {
    return _slice.call(array, begin, end);
  }
})();

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

    get.set = set;
    get.update = update;
    get.patch = patch;
    get.rm = rm;

    get.forEach = forEach;
    get.reduce = reduce;
    get.map = map;

    extend(get);

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
      if(is_empty(data))
        return new_dump();

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
              // We have no element, we can return empty collection
              ? api()
              // We have more than one element, we cannot decrease depth
              : api(root, old_depth, new_props));
    }

    function patch (name, value) {
      if (typeof name === "object") {
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
