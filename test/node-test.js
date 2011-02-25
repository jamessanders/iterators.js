require("../src/iterators.js").globalLoadIterators();
var sys = require("sys");
var fs  = require("fs");


foldAsync (function (a, b, next) {
    next(a + b);
}, 0, range(0,4), function (x) { 
    sys.debug("TEST 2: " + x) 
});

mapAsync (function(a,next){ 
    fs.readFile(a, function(err,data) {
        next("DATA: " + data);
    })
}, ["test1.txt","test2.txt"], function (x) {
    sys.debug(x);
});

eachAsync (["test1.txt","test2.txt"], 
           function (file, next) {
               var self = this;
               fs.readFile(file, function(err,data) { 
                   if (data == "newHello\n") {
                       sys.debug("ENDING");
                       self.end(data);
                   } else {
                       sys.debug(data);
                       next (data);
                   }
               });
           }, function (x) { 
               sys.debug("Finished with: " + x) 
           });
