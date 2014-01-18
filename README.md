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

### `.update(key, value)` (mutator)

### `.patch(key, value)` (mutator)

### `.rm(key, value)` (mutator)

### `.forEach(fn (value, key))` (iterator)

### `.map(fn (value, key))` (iterator)

### `.reduce(fn (accumulator, value, key), init)` (iterator)

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