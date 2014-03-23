# Ancient Oak: The Immutable Tree

Ancient Oak is an immutable data *trees* library.

Features!

-   **Deep immutability:**

    Makes the whole tree of data immutable, not only the top-level
    structure.

-   **Provides convenient interface to your data:**

    Getting, setting, deep-patching, iterating, mapping, reducing…

-   **Each modification produces a new version:**

    The old version is intact and can be still used as if no
    modification was made.

-   **Lightweight versioning:**

    New version is not a full copy, only the difference is stored.

-   Zero dependencies.

For storage Ancient Oak uses exactly the same techniques as Clojure's
immutable data structures. […]

The main difference between Ancient Oak and other JS immutable data
libraries is that Ancient Oak will transform the whole input into
immutable structures, recursively and without exception.

## Usage

The easiest way to use Ancient Oak in your project is to grab the
standalone version from [the project
page](http://szywon.pl/ancient-oak). The library is included on that
page so you can try it out in your browser's devtools.

If you're using [browserify](http://browserify.org/), you can use npm
to bring it in your project:

    npm install ancient-oak

## During development
## Included scripts

To generate standalone versions of the library and the docs you can
run those two commands.

    npm run dist
    npm run docs

Scripts in `scripts/` folder are meant to be run with `npm run` because
they depend on the environment npm is setting for them.

## Use cases

There are two main use cases:

1.  You create a data structure from scratch: you just create an empty
    collection and start adding values.

2.  You convert received data as soon as you get a hold of it: for
    example after an XHR request you convert the data just after you
    receive it.

Once you convert your data to immutable structures is safe to pass it
around.

## Types

Ancient Oak's types map 1:1 to JavaScript types. They inherit most
of their expected behaviours.

-  **Hashes/Objects**

   As with regular objects in JavaScript, keys are not guarantied to
   be sorted.

-  **Arrays**

   Sorted integer keys, size reported in `size` field, extra methods:
   `push`, `pop`, `last`.

## Quick reminder

Some types in JavaScipt (booleans, numbers and Strings) are already
immutable and don't need any special wrapping.

## Usage

Ancient Oak exposes one function: the immutabler.

The immutabler takes arbitrary data tree and returns its immutable
version.

    => I({a: 1, b: [{c: 2}, {d: 3}]})

    <= { [Function: get]
         set: [Function: modify],
         update: [Function: modify],
         patch: [Function: patch],
         rm: [Function: rm],
         forEach: [Function: forEach],
         reduce: [Function: reduce],
         map: [Function: map] }

The returned function is a getter for this structure. Example:

    => I({a: 1})("a")
    <= 1

For deeper trees, every node will have its own getter and similar
interface, recursively. Example:

    => I({a: {b: 1}})("a")
    <= { [Function: get]
         set, update, patch, … }

To get a value at deeper level, you can just travel further:

    => I({a: {b: 1}})("a")("b")
    <= 1

Note: All methods on the getter are independent of `this` value, so
they can be safely passed around without loosing their context.

### `.set(key, value)` (mutator)

Set's value for `key` to `value` and returns a new version of the
tree.

### `.update(key, fn(old))` (mutator)

Set's value for `key` to the return value of `fn(old)`. `old` is the
old value for that key.

### `.patch(diff)` (mutator)

Deep patching method. `diff` is a tree of values to be updated. For
example:

    => I({a: 1, b: {c: 2, d: 3}}).patch({b: {c: 4}, e: 5})
    // The returned version is now {a: 1, b: {c: 4, d: 3}, e: 5}


### `.rm(keys…)` (mutator)

Deep delete method. The method will delete value at "address" pointed
by series of keys.

    => I({a: 1, b: {c: 2, d: 3}}).rm("b", "c")
    // The returned version is now {a: 1, b: {d: 3}}

### `.forEach(fn(value, key))` (iterator)

Invokes `fn` for each value. The order of keys depends on the type of
the collection.

### `.map(fn(value, key))` (iterator)

Returns a new version where every value is updated with the return
value of `fn(value, key)`. Preserves type of the collection.

### `.reduce(fn(accumulator, value, key), init)` (iterator)

Invokes `fn` for the first pair of `value` and `key` with
`accumulator` being the value of `init`. For subsequent calls,
`accumulator` takes the return value of the previous
invokation. Returns the value returned by the last invokation of `fn`.

### `.dump()` & `.json()`

`dump` returns representation of the tree in plain JavaScript. `json`
does the same but returns a JSON string instead.

## Why

The problem: When we send data from one module to another we have four
options:

1.  send a new deep copy of the object

2.  `freeze` the object before sending, preventing it from being
    modified any further by anyone

3.  assume that from now on the objects belong to the other module and
    we restrain current scope from making any further modifications

4.  allow both sender and receiver to modify the object as they wish.

Each solution have some drawbacks:

1.  CPU & memory inefficiency: a copy takes time to produce, and
    doubles memory requirements for the object.

2.  requires to create a copy to "modify" the object.

3.  requires to enforce a practice, that might be difficult to make
    everyone on the team to remember it at all times.

4.  this is makes it even more difficult than 3. making both receiver
    and sender vulnerable to unsolicited changes to the object.

*…to be continued…* ;)