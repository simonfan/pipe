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

	describe('pipe string-line-partials', function () {
		it('is fine (:', function () {

			var destination = {
				set: function (key, value) {
					this[key] = value;
				}
			};


			var dataPipe = pipe({
				keyA: 'set:destKeyA',
				keyB: 'set:destKeyB',
			})
			.to(destination);

			dataPipe.inject({
				keyA: 'valueA',
				keyB: 'valueB'
			});


			destination.destKeyA.should.eql('valueA');
			destination.destKeyB.should.eql('valueB');

		});
	});
});
