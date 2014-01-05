"use strict";

module.exports = storage;

function pass (value) {
  return value;
}

function storage (options) {
  var split_key = options.split_key;
  var merge_key = options.merge_key;

  var copy = options.copy;
  var new_node = options.new_node;
  var min_depth = options.min_depth;
  var zero = options.zero;

  var iterate = options.iterate;

  return store;

  function store (input, value_transform) {
    value_transform = value_transform || pass;

    var result = api();

    iterate(input, function (value, key) {
      result = result.set(key, value_transform(value));
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

    get.immutable_api = true;

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
