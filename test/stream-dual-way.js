(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'pipe',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(pipe, should) {
	'use strict';

	describe('pipe dual-way', function () {


		beforeEach(function () {

			var destination = this.destination = {
				data: {},
				get: function (prop) {
					return this.data[prop];
				},
				set: function (prop, value) {
					this.data[prop] = value;

					return this;
				},
			};


			var source = this.source = {
				attributes: {},

				// classical getter setter
				attr: function (prop, value) {

					if (arguments.length === 1) {

						return this.attributes[prop];

					} else if (arguments.length === 2) {

						this.attributes[prop] = value;

						return this;
					}

				},
			};


			var pipeline = pipe.extend({

				srcGet: function (source, prop) {
					return source.attr(prop);
				},

				srcSet: function (source, prop, value) {
					return source.attr(prop, value);
				},

				destGet: function (destination, prop) {
					return destination.get(prop);
				},

				destSet: function (destination, prop, value) {
					return destination.set(prop, value);
				},

			})

			// instantiate the pipe
			this.pipe = pipeline({
				key1: 'destKey1',
				key2: 'destKey2'
			})
			.from(source)
			.to(destination);
		});

		it('drains', function () {

			var destination = this.destination,
				source      = this.source,
				pipe        = this.pipe;

			// set some values on destination
			destination.set('destKey1', 'v1');
			destination.set('destKey2', 'value2')

			// drain values
			pipe.drain();

			// source should have changed
			source.attr('key1').should.eql('v1');
			source.attr('key2').should.eql(destination.get('destKey2'));
		});

		it('pumps', function () {

			var destination = this.destination,
				source      = this.source,
				pipe        = this.pipe;

			// set some values on destination
			source.attr('key1', 'v1');
			source.attr('key2', 'value2');

			pipe.pump();

			destination.get('destKey1').should.eql(source.attr('key1'));
			destination.get('destKey2').should.eql(source.attr('key2'));

		});
	});
});
