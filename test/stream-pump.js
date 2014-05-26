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

	describe('pipe stream-pump', function () {

		it('pump() to single', function () {

			var source      = {},
				destination = {};

			source.key1 = 'v1';
			source.key2 = 'v2';

			var p = pipe({
				key1: 'destKey1',
				key2: 'destKey2'
			})
			.from(source)
			.to(destination);

			p.pump();

			destination.should.eql({
				destKey1: 'v1',
				destKey2: 'v2'
			});

		});

		it('pump() to many', function () {



		});
	});
});
