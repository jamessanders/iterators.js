# iterators.js #

## About ##

Iterators are a useful pattern that allow one to iterate over collections of any type using general purpose functions.  

This library defines a simple pattern to create iterators and several basic iterator objects for javascript. 


## Iterators ##

Iterators are defined as objects with a `.next()` method.  An enumerator function
will take an iterator and call `.next()` on it until `.next()` returns
`StopIteration`.

This can best be explain with an example.  The following is an example of the
list iterator wrapper included in interators.js

    function ListIterator (ls) {
        var i = 0;
        this.next = function () {
            if (i < ls.length)
                return ls[i++];
            else 
                return StopIteration;
        };
    };

All the above code does is walk the list every time the `.next()` method is
called.  When the end of the list is reached the `.next()` method returns
`StopIteration`.

We can use the example iterator above like so.

    var myIter = new Listerator ([1,2,3]);
    myIter.next() # returns 1
    myIter.next() # returns 2
    myIter.next() # returns 3
    myIter.next() # returns StopIteration
    
Of course the above usage example is not all that useful at all, in fact
iterators are usally only useful when a function exists to use them, that's
where enumerators come in.


## Enumerators ##

Iterators.js provides us with three standard enumerator functions they are
listed as follows:

`fold` - Takes as arguments a function an iterator and a starting value. This
function is often called "reduce" in other languages thought I feel fold is
more accurate.  `fold` builds up a new value by fold over the iterator.  For
example:

    fold(new ListIterator([1,2,3]), 0, function(a, b) {
        return a + b;
    });

The above example will sum the numbers 1, 2, 3 (producing 6).  It worth noting
that thought we specifically created a new ListIterator in the above example
`fold` can actually do this step for you.

`map` - Takes as arguments a function and an iterator.  Map simply maps a
function over an iterator.  For example:

    map([1,2,3], function (a) { return a + 2 });
    
The above example will add 2 to every item in the iterator return the array
([3, 4, 5]).

`each` - Takes as arguments an iterator and a function.  Each is the same as
map except that it returns nothing (technically).  Each should generally be
used only to perform some sort of side effect.

    each([1,2,3], function (a) { console.log(a) });
    
The above example will write the numbers 1, 2 and 3 to the console.
      
### Asynchronous Enumerators ###

When using Node.js it is often the case that you need to perform some IO
action on a list of things asynchronously.  Iterators.js provides asynchronous
versions of the same three functions above.

`foldAsync` - Takes a callback function a starting values an iterator and a
continuation function.  The callback function should take as arguments the
accumulated value the current iteration and a continuation function.  The
asynchronous version of the example above would look like the following.

    foldASync(new ListIterator([1,2,3]), 0, function(a, b, next) {
        next(a + b);
    }, function(a) { console.log(a) });

`mapAsync` - Takes a callback function an iterator and a continuation
function.  The callback function should take the current iteration and a
continuation function.  The asynchronous version of the above example would
look as follows.

    mapAsync([1,2,3], function(a, next) { 
                        next(a + 2) 
                      }, function (a) { console.log(a) });

`eachAsync` - Is basically the same as mapAsync but with its arguments
reversed.

    each([1,2,3], function (a) { console.log(a); next() });
    
### Enumerator tricks ###

When you use the above enumerator functions the callback functions you provide
are ran with `this` set to the enumerator object.  This little hack allows one
to escape the enumerator early but calling `this.end(v)` from within a
callback.  If one provides an argument to `this.end` then that argument is
considered that last returned value from the callback.
