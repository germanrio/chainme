// could probably replace this with something more light weight
var deferred = require('deferred');

var MakeChained = function(klass) {
    // Chained klass extends klass, but wraps all of its prototype methods
    var chained_klass = function(){
        klass.apply(this, arguments);
        this._previous_promise = deferred(1);
    };

    // Extend chained_klass's prototype
    chained_klass.prototype = Object.create(klass.prototype);

    // Only overwrite methods directly on klass
    Object.getOwnPropertyNames(klass.prototype).forEach(function(name) {
        if(name === "constructor") return;
        var fn = klass.prototype[name];
        chained_klass.prototype[name] = getWrappedFn(fn);
    });

    return chained_klass;
};

var getWrappedFn = function(fn) {
    return function() {
        // 'this' refers to the instance of the passed in klass/chained_klass

        var def = deferred();

        var callback = function() {
            def.resolve();
        };

        // Append callback to argument list
        var args = Array.prototype.slice.call(arguments);
        args.push(callback);

        // If there was a promise in the queue, wait for it to finish
        var self = this;
        this._previous_promise
            .then(function(){
                fn.apply(self, args);
            }).done();

        this._previous_promise = def.promise;

        return this;
    };
};

module.exports = MakeChained;