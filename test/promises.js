(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'pipe',
		// dependencies for the test
		deps = [mod, 'should', 'q'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(pipe, should, q) {
	'use strict';

	describe('pipe promise interface', function () {
		beforeEach(function () {

			var destination = this.destination = {
				data: {},
				delayedGet: function (prop) {

					return q.delay(this.data[prop], 250);
				},

				delayedSet: function (prop, value) {

					var defer = q.defer();

					setTimeout(function () {

						this.data[prop] = value;

						defer.resolve(this);

					}.bind(this), 250);

					return defer.promise;
				},
			};


			var source = this.source = {
				attributes: {},

				// classical getter setter
				delayedAttr: function (prop, value) {

					var res;

					if (arguments.length === 1) {

						res = this.attributes[prop];

					} else if (arguments.length === 2) {

						this.attributes[prop] = value;

						res = this;
					}

					return q.delay(res, 250);
				},
			};


			var pipeline = pipe.extend({

				srcGet: function (source, prop) {
					return source.delayedAttr(prop);
				},

				srcSet: function (source, prop, value) {
					return source.delayedAttr(prop, value);
				},

				destGet: function (destination, prop) {
					return destination.delayedGet(prop);
				},

				destSet: function (destination, prop, value) {
					return destination.delayedSet(prop, value);
				},

			})

			// instantiate the pipe
			this.pipe = pipeline({
				key1: 'destKey1',
				key2: 'destKey2'
			})
			.from(source)
			.to(destination);


		})


		it('pump returns promise', function (testdone) {

			var source      = this.source,
				destination = this.destination,
				pipe        = this.pipe;


			// set values on source
			source.attributes.key1 = 'value-1';
			source.attributes.key2 = 'value-2';

			var time = new Date();


			pipe.pump()
				.done(function () {

					var delay = new Date() - time;

					delay.should.be.greaterThan(499, 'delayedAttr delay: 250, delayedSet delay: 250');
					delay.should.be.lessThan(570);

					destination.data.destKey1.should.eql('value-1');
					destination.data.destKey2.should.eql('value-2');

					testdone();
				});

		});

		it('drain returns promise', function (testdone) {
			var source      = this.source,
				destination = this.destination,
				pipe        = this.pipe;


			// set values on source
			destination.data.destKey1 = 'value-dest-1';
			destination.data.destKey2 = 'value-dest-2';

			var time = new Date();

			pipe.drain()
				.done(function () {

					var delay = new Date() - time;

					delay.should.be.greaterThan(499, 'delayedAttr delay: 250, delayedSet delay: 250');
					delay.should.be.lessThan(570);


					source.attributes.key1.should.eql('value-dest-1');
					source.attributes.key2.should.eql('value-dest-2');

					testdone();
				});
		});
	});
});
