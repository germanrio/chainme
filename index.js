// could probably replace this with something more light weight
var deferred = require('deferred');

var MakeChained = function(klass) {
    var chained_klass = function(){
        klass.apply(this, arguments);
        this._chainme_promises = [];
    };

    for(var name in klass.prototype) {
        var fn = klass.prototype[name];
        chained_klass.prototype[name] = getWrappedFn(name, fn);
    }

    return chained_klass;
};

var getWrappedFn = function(name, fn) {
    return function() {
        // 'this' refers to the instance of the passed in klass/chained_klass
        var pending_promise = this._chainme_promises.pop();

        var def = deferred();
        this._chainme_promises.push(def.promise);

        var callback = function() {
            def.resolve();
        };

        // Append callback to argument list
        var mainArguments = Array.prototype.slice.call(arguments);
        mainArguments.push(callback);

        // If there was a promise in the queue, wait for it to finish
        if(pending_promise) {
            var self = this;
            pending_promise
                .then(function(){
                    fn.apply(self, mainArguments);
                }).done();
        } else {
            fn.apply(this, mainArguments);
        }

        return this;
    };
};

module.exports = MakeChained;