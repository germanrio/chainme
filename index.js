// could probably replace this with something more light weight
var Q = require('q');

MakeChained = function(klass) {
	var chained_klass = function(){
		klass.call(this);
		this._chainme_promises = [];
	};

	for(var name in klass.prototype) {
		var fn = klass.prototype[name];
		chained_klass.prototype[name] = get_wrapped_fn(name, fn);
	}

	return chained_klass;
};

get_wrapped_fn = function(name, fn) {
	return function() {
		// 'this' refers to the instance of the passed in klass/chained_klass
		var previousPromise = this._chainme_promises.pop();

		var newPromise = Q.defer();
		this._chainme_promises.push(newPromise.promise);

		var callback = function() {
			newPromise.resolve();
		};

		// Append callback to argument list
		var mainArguments = Array.prototype.slice.call(arguments);
		mainArguments.push(callback);

		// If there was a promise in the queue, wait for it to finish
		if(previousPromise) {
			var self = this;
			previousPromise.then(function(){
				fn.apply(self, mainArguments);
			});
		} else {
			fn.apply(this, mainArguments);
		}

		return this;
	};
};

module.exports = MakeChained;