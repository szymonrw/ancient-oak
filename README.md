# Immu

Experimental implementation of immutable versioned data structures
([MVCC](http://en.wikipedia.org/wiki/Multiversion_concurrency_control))
for JavaScript.

Immu provides simple API for storing and modifying data structures
(trees of objects). Each modification produces a new version storing
only modified properties. This makes keeping many versions of the same
data light weight. Old version is intact and any other users of it can
use it as it was never changed.

## The `I` function and the API

*The API will change probably in a near future*

Entry point of the immu library is the `I` function. `I` creates
initial version of the data returning the API for accessing it. Any
properties that have mutable values will get their own instances of
the API, recursively.

### getter

    (name[, …])

`I` returns a function that will return the value pointed by name. If
the value is mutable, the returned value is another API object itself.
Thus, any values on deeper levels can be accessed either via

    ("a")("b")("c")

or by using the short-hand:

    ("a", "b", "c")

### patch

    .patch(diff)

Multi-level update. Patches object by overwriting supplied properties
in `diff`. If a value for a property is an object, the value for that
property will be patched recursively. Example:

    var a = I({a: 1, b: 2, c: {d: 3, e: 4}});
    var b = a.patch({b: 5, c: {d: 6}});
    // b is {a: 1, b: 5, c: {d: 6, e: 4}}

Returns a new version of the data.

### rm

    .rm(name[, …])

Deletes value with a given name. If more than one name is passed in,
it will reach deeply into the structure to delete a field on a path.

    var a = I({a: 1, b: {c: 2, d: 3}})

    var b = a.rm("b");
    // b is {a: 1}

    var c = a.rm("b", "c");
    // c is {a: 1, b: {d: 3}}

Returns a new version of the data.

### dump

    .dump()

Returns plain JavaScript object tree of the data.

### keys

    .keys()

Returns an array containing all key names.

### back (might get deprecated)

    .back()

Returns one version back. This method is a side effect of current
implementation and will likely go away.

### compat (might get deprecated)

    .compat()

"Flatten" the history. Current implementation preserves all history by
default, even objects that have been overwritten in newer versions or
marked as deleted. This prevents GC from swiping them. `compat` method
will return a new version of the data that is not linked to any
previous version, thus allowing GC to do it's job (as long as we null
reference to the data we called `compat` on).

## Why

The problem: When we send data from one module to another we have four
options:

1.  send a new deep copy of the object

2.  `freeze` the object before sending, preventing it from being
    modified any further by anyone

3.  assume that from now on the objects belong to the other module and
    we restrain current scope from making any further modifications

4.  allow both sender and receiver to modify the object as they wish.

Each one solution have some drawbacks:

1.  CPU & memory inefficiency: a copy takes time to produce, and
    doubles memory requirements for the object.

2.  requires to create a copy to "modify" the object.

3.  requires to enforce a practice, that might be difficult to make
    everyone on the team to remember it at all times.

4.  this is makes it even more difficult than 3. making both receiver
    and sender vulnerable to unsolicited changes to the object.

*…to be continued…* ;)