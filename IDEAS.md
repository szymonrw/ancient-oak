# Feature ideas

## Typed Arrays support

support for all typed arrays (detecting automatically)

## Lazy mode

- until all operations are write ops, don't create new versions
- creating the tree structure of an array/object should be only necessary if we want to write after first read
- this should give a lot speed, especially if data is only used in the middle of a chain of transformations

## Better slice

`slice` would create a new version of the original array with:

- parts that are out of the new scope are cut out at the structural level
  - leafs that contain only inaccessible indexes are removed
  - inaccessible indexes from remaining leafs are nulled
  - any nodes (not leafs) that had their children removed on their left side are shifted left so that there's no empty space

This way we get rid of all inaccessible references. The shifting part
is there to limit accumulation of start offset. Because we only allow
to have empty space in left-most leaf, the maximum start offset is
only 31 (because leaf size is 32).