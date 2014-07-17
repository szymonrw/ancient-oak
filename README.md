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
immutable data structures. (see [Resources](#resources))

The main difference between Ancient Oak and other JS immutable data
libraries is that Ancient Oak will transform the whole input into
immutable structures, recursively and without exception.

## Usage

There are three ways of using ancient-oak:

- `npm install ancient-oak` for node and browserify projects
- `bower install ancient-oak` for bower users
- `component install brainshave/ancient-oak` for component users
- grab the browser-ready standalone release from the [dist folder](https://github.com/brainshave/ancient-oak/tree/master/dist)

## Resources

- talk: [Immutable Data Trees in JavaScript](http://vimeo.com/86694423) by [brainshave](http://brainshave.com), (introduction, quite technical, February 2014 at [Ember London](http://emberlondon.com), [slides](http://brainshave.com/talks/immutable-data-trees))
- talk: [Using Persistent Data Structures with Ember.js](http://vimeo.com/89089876) by [Jamie White](http://jgwhite.co.uk) (March 2014 at [Ember London](http://emberlondon.com), [example project](https://github.com/jgwhite/ember-ancient-oak))
- article: [Understanding Clojure’s Persistent Vectors](http://hypirion.com/musings/understanding-persistent-vector-pt-1) by Jean Niklas L’orange is a very good write-up on how those data structures work internally

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

Ancient Oak's types map 1:1 to JavaScript types. They inherit most of
their expected behaviours. Currently Ancient Oak is meant to work best
with trees of plain objects, arrays, dates and primitive types. Think
of plain data trees, JSON-able.

### Hashes/Objects

As with regular objects in JavaScript, keys are not guarantied to
be sorted.

### Arrays

Sorted integer keys, size reported in `.size` field, extra methods:
`.push`, `.pop`, `.slice`.

### Dates

Reflect native date objects. Native `.get*` and `.set*` methods are
accessible with the getter, `.set`, `.patch` and `.update`. Name of
properties can be written either with underscores or in camel case,
"utc" can be lowercase.

    var d1 = I(new Date)
    var d2 = d1.set("utc_hours", 1)
    var d3 = d1.update("utc_hours", function (h) { return h + 1 })

Dates don't implement `.rm` or any iterators (`.map`, `.reduce`, etc.).

### Primitive types

Primitive types in JavaScript (booleans, numbers and strings) are
already immutable and don't need any special wrapping.

## Immortalising

Ancient Oak exposes one function: the immortaliser (`I` in the
standalone build).

The immortaliser takes arbitrary data tree and returns its immutable
version.

    => I({a: 1, b: [{c: 2}, {d: 3}]})
    <= function get (key) {…}

## Getting, dumping

Once the structure is immutable we need to get the data back somehow.

### `get(key)`

**This is the function returned the immortaliser, not a method.** The
rest of the API are methods on `get`.

Returns the value for `key`. Example:

    => I({a: 1})("a")
    <= 1

For deeper trees, every node will have its own getter and similar
interface, recursively. Example:

    => I({a: {b: 1}})("a")
    <= I({b: 1})

To get a value at a deeper level, we just travel further down:

    => I({a: {b: 1}})("a")("b")
    <= 1

Note: All methods on the getter are independent of `this` value, so
they can be safely passed around without losing their context.

### `.dump()` & `.json()`

`.dump()` returns representation of the tree in plain JavaScript.

`.json()` returns JSON representation of the tree.

## Forking

Forkers are methods that create new versions (forks) of a structure
with selected values updated or removed.

### `.set(key, value)`

New version has the value for `key` set to `value`.

### `.update(key, fn(old))`

New version has the value for the `key` updated to the return value of
`fn` called on the old value for that key.

    => I({a: 1}).update(function (v) { return v + 1 })
    <= I({a: 2})

### `.patch(diff)`

Deep patching. `diff` is a tree of values to be updated in the new
version. For example:

    => I({a: 1, b: {c: 2, d: 3}}).patch({b: {c: 4}, e: 5})
    <= I({a: 1, b: {c: 4, d: 3}, e: 5})


### `.rm(keys…)`

Deep delete. Returns a version without the part of the tree pointed by
`keys…` (multiple arguments).

    => I({a: 1, b: {c: 2, d: 3}}).rm("b", "c")
    <= I({a: 1, b: {d: 3}})

## Iterating

Iterators walk over every element in the array or object.

### `.forEach(fn(value, key))`

Invokes `fn` for each value. The order of keys depends on the type of
the collection (no guarantee of order for . Does not produce any new versions. Returns the tree it
was called on.

### `.reduce(fn(accumulator, value, key), init)`

Invokes `fn` for the first pair of `value` and `key` with
`accumulator` being the value of `init`. For subsequent calls,
`accumulator` takes the return value of the previous
invocation. Returns the value returned by the last invocation of `fn`.

### `.map(fn(value, key))`

Returns a new version where every value is updated with the return
value of `fn(value, key)`. Preserves type of the collection
(object/array).

### `.filter(fn(value, key))`

Filters values by the return value of `fn` called on each
element. Preserves the type (object/array).

## Why

The problem: When we send data from one module to another we have four
options:

1.  send a new deep copy of the object

2.  `.freeze` the object before sending, preventing it from being
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

## Included scripts

Scripts in the `scripts` directory are meant to be run with `npm run`:

- `npm test`: run test suite
- `npm run dist`: generate standalone versions
- `npm run release`: meant to be only run by a maintainer, build the standalone version, publish to npm and a tag the current version

## Licence

MIT, see [COPYING](COPYING).