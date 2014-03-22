# Feature ideas

## Dates

needed like now.

## Typed Arrays support

support for all typed arrays (detecting automatically)

## Lazy mode

- until all operations are write ops, don't create new versions
- creating the tree structure of an array/object should be only necessary if we want to write after first read
- this should give a lot speed, especially if data is only used in the middle of a chain of transformations
