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
		it('is fine (:', function (done) {

			var destination = {
				set: function (key, value) {
					this[key] = value;
				}
			};

			var source = {};

			// class
			var dpipe = pipe.extend({

				destSet: function (object, key, value) {

					var method = key.split(':')[0],
						arg    = key.split(':')[1];

					console.log(method);
					console.log(arg);

					object[method](arg, value);
				},
			})


			var dataPipe = dpipe({
				keyA: 'set:destKeyA',
				keyB: 'set:destKeyB',
			})
			.from(source)
			.to(destination);

			dataPipe.inject({
				keyA: 'valueA',
				keyB: 'valueB'
			})
			.done(function () {


				source.keyA.should.eql('valueA');
				source.keyB.should.eql('valueB');

				destination.destKeyA.should.eql('valueA');
				destination.destKeyB.should.eql('valueB');

				done()
			});

		});
	});
});
