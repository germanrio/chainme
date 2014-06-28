# Another async chaining library

Very similar to https://github.com/vvo/chainit, but with a simpler implementation leveraging deferreds.

Basically -- after you build a class, `Car`, pass it to `ChainMe` and it will return the same class, but now all of your prototype methods will have the ability to be chained, even if they're asynchronous methods! How do the async methods work? Every prototype method _must_ take an extra parameter, `done`, which is a method that must be called to signify the asynchronous method has completed.

## Installation

    npm install chainme

## Usage

I wouldn't actually use this.. it was just an exercise in building such a library.

    var ChainMe = require('chainme');

    // This is the class we will convert to a chained API
    var Car = function() { };

    Car.prototype.drive = function(ms, done) {
        console.log("here we go!");
        setTimeout(function(){
            console.log("That took " + ms + " milliseconds!");
            done();
        }, ms)
    };

    Car.prototype.stop = function(done) {
        setTimeout(function() {
            console.log("We have come to a complete stop");
            done();
        }, 1000)
    };


    var ChainedCar = ChainMe(Car);


    var c = new ChainedCar();

    c.drive(2000).stop().drive(1000).stop();