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

	describe.skip('pipe mapping', function () {

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


		describe('pipe destinations', function () {

			it('pipe.to(destination)', function (testdone) {
				var destination1 = {},
					destination2 = {},
					source       = {
						key1: 'v1',
						key2: 'v2'
					};

				var p = pipe({
					key1: 'dest-key1',
					key2: 'dest-key2',
				})
				.from(source)
				.to(destination1);

				p.pump()
					.then(function () {

						destination1.should.eql({
							'dest-key1': 'v1',
							'dest-key2': 'v2'
						});
					})
					.then(function () {


						// change destination
						p.to(destination2);
						// set some values on source
						source.key1 = 'v1-for-dest-2';

						return p.pump();
					})
					.then(function () {

						destination2.should.eql({
							'dest-key1': 'v1-for-dest-2',
							'dest-key2': 'v2'
						});

						// destination1 remains unchanged
						destination1.should.eql({
							'dest-key1': 'v1',
							'dest-key2': 'v2'
						});

						testdone();

					})
					.done();
			});


			it('pipe.addDestinations(dest)', function (testdone) {

				var destination1 = {},
					destination2 = {},
					source       = {
						key1: 'v1',
						key2: 'v2',
					};

				// pipe
				var p = pipe({
					key1: 'dkey1',
					key2: 'dkey2',
				})
				.from(source);

				p.addDestination(destination1);

				p.pump()
					.then(function () {

						destination1.dkey1.should.eql('v1');
						destination1.dkey2.should.eql('v2');
					})
					.then(function () {

						p.addDestination(destination2);
						source.key1 = 'v1-altered';

						return p.pump();
					})
					.then(function () {
						destination1.should.eql(destination2);
						destination2.dkey1.should.eql('v1-altered');
						destination2.dkey2.should.eql('v2');


						testdone();
					})
					.done();



			});

			it('pipe.removeDestination()', function (testdone) {

				var destination1 = { id: '1' },
					destination2 = { id: '2' },
					source       = {
						key1: 'v1',
						key2: 'v2',
					};

				var p = pipe({
					key1: 'dkey1',
					key2: 'dkey2'
				})
				.from(source)
				.to([destination1, destination2]);

				p.pump()
					.then(function () {

						destination1.dkey1.should.eql('v1');
						destination1.dkey2.should.eql('v2');
						destination2.dkey1.should.eql('v1');
						destination2.dkey2.should.eql('v2');
					})
					.then(function () {
						// remove destination1
						p.removeDestination(function (dest) {
							return dest.id === '1';
						});

						// alter source
						source.key1 = 'v1-altered';
						source.key2 = 'v2-altered';

						p.pump();
					})
					.then(function () {

						// removed destination remains unaltered
						destination1.dkey1.should.eql('v1', 'removed destination remains unaltered');
						destination1.dkey2.should.eql('v2', 'removed destination remains unaltered');

						// remaining destination changes
						destination2.dkey1.should.eql('v1-altered');
						destination2.dkey2.should.eql('v2-altered');


						testdone();
					})
					.done();

			});

		})


	});
});
