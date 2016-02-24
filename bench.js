var m = require("mori"),
    OakArray = require("./lib/types/array"),
    Immutable = require("immutable");

function time(label, f, iters) {
  iters = iters || 1;
  for(var i = 0; i < iters; i++) {
    var s = new Date();
    f();
    console.log(label + ": Elapsed "+((new Date()).valueOf()-s.valueOf())+"ms");
    console.log("----------");
  }
}

// // ~180ms Node 0.10.35, 2.26ghz 2010 MBP
// time('mori hash', function() {
//   var hm = m.hashMap();
//   for(var i = 0 ; i < 100000; i++) {
//     for(var j = 0; j < 8; j++) {
//       hm = m.assoc.f3(hm, "foo"+j, j);
//     }
//   }
// });

// // ~2000ms
// time('immu hash', function() {
//   var hm = Immutable.Map();
//   for(var i = 0 ; i < 100000; i++) {
//     for(var j = 0; j < 8; j++) {
//       hm = hm.set("foo"+j, j);
//     }
//   }
// });

// time('oak hash', function() {
//   var hm = oak({});
//   for(var i = 0 ; i < 100000; i++) {
//     for(var j = 0; j < 8; j++) {
//       hm = hm.set("foo"+j, j);
//     }
//   }
// });


// ~330ms
time('mori vec', function() {
  var v = m.vector();
  for(var i = 0 ; i < 10000000; i++) {
    v = m.conj.f2(v, i);
  }
});

// ~2500ms
time('immu vec', function() {
  var l = Immutable.List();
  for(var i = 0 ; i < 10000000; i++) {
    l = l.push(i);
  }
});

time('oak vec', function() {
  var l = new OakArray();
  for(var i = 0 ; i < 10000000; i++) {
    l = l.push(i);
  }
});

// // ~80ms
// time('mori smth', function() {
//   var v = m.mutable.thaw(m.vector());
//   for(var i = 0 ; i < 1000000; i++) {
//     v = m.mutable.conj.f2(v, i);
//   }
//   v = m.mutable.freeze(v);
// });

// // ~500ms
// time('immu smth', function() {
//   var l = Immutable.List().asMutable();
//   for(var i = 0 ; i < 1000000; i++) {
//     l = l.push(i);
//   }
//   l.asImmutable();
// });
