function __makeIterators (env) {

    ////////////////////////////////////////////////////////////////////////
    // Iterators 
    ////////////////////////////////////////////////////////////////////////

    function StopIteration () { return true };

    function ListIterator (ls) {
        var i = 0;
        this.next = function () {
            if (i < ls.length)
                return ls[i++];
            else 
                return StopIteration;
        };
    };

    function ZipIterator (a, b) {
        this.next = function () {
            var x = a.next();
            var y = b.next();
            if (x != StopIteration && y != StopIteration) 
                return [x, y];
            else
                return StopIteration;
        };
    };

    function CycleIterator (ls) {
        var i = 0;
        var rec = [];
        this.next = function () {
            var x = ls.next();
            if (x == StopIteration) {
                this.next = function () {
                    if (i >= rec.length) {
                        i = 0;
                    }
                    return rec[i++];
                };
                return this.next();
            } else {
                rec.push(x);
                return x;
            }
        }
    }
    
    function NullIterator () {
        this.next = function () { return StopIteration };
    };

    function RangeIterator (a,b) {
        this.next = function () { 
            if (b && a >= b) return StopIteration ;
            else return a++;
        };
    };

    function CountIterator (i) {
        this.next = function () { return i++ };
    };


    Array.prototype.toIterator = function () { return (new ListIterator(this)); };

    var makeIterator = function (obj) { 
        if (obj != undefined) {
            return obj.hasOwnProperty("next") ? obj : obj.toIterator(); 
        } else {
            return (new NullIterator());
        }
    };

    function Enumerator (iterator, accum) {
        this.stop = false;
        this.accum = accum;
        this.end = function (ret) {
            this.stop = true;
            if (ret != undefined) {
                this.accum = ret;
            }
        };

        this.run = function (fn) {
            var n = iterator.next();
            while (n != StopIteration && !this.stop) {
                var ret = (fn.call(this, this.accum, n));
                if (!this.stop) {
                    this.accum = ret;
                }
                n = iterator.next();
            }
            return this.accum;
        };
    }

    var zip = function zip (a, b) { 
        return (new ZipIterator(makeIterator(a),makeIterator(b))); 
    };
    env.zip = zip;

    var cycle = function cycle(ls) {
        return (new CycleIterator(makeIterator(ls)));
    };
    env.cycle = cycle;

    var range = function range (start, end) {
        return (new RangeIterator(start, end));
    };
    env.range = range;
    
    var toList = function (obj) { 
        var iterator = makeIterator(obj);
        return map(function(b){ return b; }, iterator); 
    };
    env.toList = toList;

    var each = function each (obj, fn) {
        var iterator = makeIterator(obj);
        return (new Enumerator(iterator, undefined).run(function(a,b) { return fn.call(this, b) }));
    };
    env.each = each;

    var map = function map (fn, obj) {
        var iterator = makeIterator(obj);
        var en = new Enumerator(iterator, []);
        return en.run(function(a,b) {
            return a.concat([fn.call(this,b)]);
        });
    };
    env.map  = map;

    var fold = function fold (fn, def, obj) {
        var iterator = makeIterator(obj);
        var en = new Enumerator(iterator, def);
        return en.run(fn);
    };
    env.fold = fold;
}

function globalLoadIterators () {
    try {
        __makeIterators(window);
    } catch (err) {
        __makeIterators(global);
    }
};

