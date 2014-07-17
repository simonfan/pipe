(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'pipe',
		// dependencies for the test
		deps = [mod, 'should', 'subject', 'backbone'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(pipe, should, subject, Backbone) {
	'use strict';

	describe('pipe wrapper', function () {

		it('general wrapper for both', function () {



			/**
			 * Wraps objects into backbone model.
			 * @param  {[type]} object [description]
			 * @return {[type]}        [description]
			 */
			var wrap = function wrap(object) {
				return new Backbone.Model(object);
			};

			/**
			 * Class
			 * @type {[type]}
			 */
			var modelPipe = pipe.extend({
				buildSrc: wrap,
			});

			/**
			 * Instance
			 * @type {[type]}
			 */
			var mpipe = modelPipe({
				name: 'anotherAttribute'
			});

			// define source and destination object
			var src = { name: 'Alice', lastName: 'Rodriguez' },
				dest = {};

			mpipe
				.from({
					name: 'Alice',
					lastName: 'Last'
				})
				.to({})

		});

		it('specific wrappers for src and dest', function () {

			var srcWrapper = subject({

			});


			var destwrapper = subject({

			});

		});
	});
});
