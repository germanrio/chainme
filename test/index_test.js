var expect = require("expect.js"),
    ChainMe = require('../index');

describe("index.js", function() {
    var _Car, Car;

    beforeEach(function() {
        var _Automobile = function(){}
        _Automobile.prototype.move = function() {}
        
        _Car = function(color) {
            this.color = color;
            this.miles = 0;
        };

        _Car.prototype = Object.create(_Automobile);

        _Car.prototype.drive = function(miles, done) {
            var self = this;
            setTimeout(function(){
                self.miles += miles;
                done();
            }, 100);
        };

        _Car.prototype.reverse = function(miles, done) {
            var self = this;
            setTimeout(function() {
                self.miles -= miles;
                done();
            }, 100);
        };

        // Hooking purposes for tests
        _Car.prototype.done = function(cb, done) {
            cb();
            done();
        };

        Car = ChainMe(_Car);
    });


    it("should respect initializer arguments", function() {
        var c = new Car('blue');
        expect(c.color).to.eql('blue');
    });

    it("should have the same prototype methods", function() {
        var own_methods = Object.getOwnPropertyNames(Car.prototype);
        expect(own_methods).to.eql(["drive", "reverse", "done"]);
    });

    it("can call methods", function(next) {
        var c = new Car('blue');

        c.drive(100).done(function(){
            expect(c.miles).to.eql(100);
            next();
        });
    });

    it("can call a method twice", function(next) {
        var c = new Car('blue');

        c.drive(100).drive(100).done(function(){
            expect(c.miles).to.eql(200);
            next();
        });
    });

    it("can chain two methods", function(next) {
        var c = new Car('blue');

        c.drive(100).reverse(100).done(function(){
            expect(c.miles).to.eql(0);
            next();
        });
    });
});