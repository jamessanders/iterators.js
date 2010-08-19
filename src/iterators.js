function __makeIterators (env) {

    ////////////////////////////////////////////////////////////////////////
    // Iterators 
    ////////////////////////////////////////////////////////////////////////

    function StopIteration () { return true };
    env.StopIteration = StopIteration;

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
    
    function ObjectIterator (obj) {
        var ls = [];
        for (k in obj) {
            if (obj.hasOwnProperty(k)){
                ls.push([k, obj[k]]);
            }
        }
        var it = new ListIterator(ls);
        this.next = function () { return it.next() };
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

    Object.prototype.toIterator = function () { return (new ObjectIterator(this)); };
    Array.prototype.toIterator  = function () { return (new ListIterator(this)); };

    var Iterator = function (obj) { 
        if (obj != undefined) {
            return obj.hasOwnProperty("next") ? obj : obj.toIterator(); 
        } else {
            return (new NullIterator());
        }
    };
    env.Iterator = Iterator;

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
        return (new ZipIterator(Iterator(a),Iterator(b))); 
    };
    env.zip = zip;

    var cycle = function cycle(ls) {
        return (new CycleIterator(Iterator(ls)));
    };
    env.cycle = cycle;

    var range = function range (start, end) {
        return (new RangeIterator(start, end));
    };
    env.range = range;
    
    var toList = function (obj) { 
        var iterator = Iterator(obj);
        return map(function(b){ return b; }, iterator); 
    };
    env.toList = toList;

    var each = function each (obj, fn) {
        var iterator = Iterator(obj);
        return (new Enumerator(iterator, undefined).run(function(a,b) { return fn.call(this, b) }));
    };
    env.each = each;

    var map = function map (fn, obj) {
        var iterator = Iterator(obj);
        var en = new Enumerator(iterator, []);
        return en.run(function(a,b) {
            return a.concat([fn.call(this,b)]);
        });
    };
    env.map  = map;

    var fold = function fold (fn, def, obj) {
        var iterator = Iterator(obj);
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

globalLoadIterators();