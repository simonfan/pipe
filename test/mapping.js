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

	describe('pipe mapping', function () {

		it('pipe.from(source)', function (testdone) {

			var destination = {},
				source1     = {
					key1: 'source-1-v1',
					key2: 'source-1-v2'
				},
				source2     = {
					key1: 'source-2-v1',
					key2: 'source-2-v2'
				};

			var p = pipe({
				key1: 'dest-key1',
				key2: 'dest-key2',
			})
			.from(source1)
			.to(destination);


			p.pump()
				.then(function () {

					destination.should.eql({
						'dest-key1': 'source-1-v1',
						'dest-key2': 'source-1-v2'
					});

				})
				.then(function () {
					// change source
					p.from(source2);

					p.pump();
				})
				.then(function () {

					destination.should.eql({
						'dest-key1': 'source-2-v1',
						'dest-key2': 'source-2-v2'
					});

					testdone();
				})
				.done();

		});

	});
});
