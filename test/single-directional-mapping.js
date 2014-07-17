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

	describe('pipe single-directional-mapping', function () {
		it('pump only', function () {

			// pipe
			var p = pipe({
				keyA: { dest: 'destKeyA', direction: 'drain' },
				keyB: { dest: 'destKeyB', direction: 'both' },
				keyC: { dest: 'destKeyC', direction: 'pump' },
			});

			// define endpoints
			var src  = {
					keyA: 'srcValueA',
					keyB: 'srcValueB',
					keyC: 'srcValueC',
				},
				dest = {};

			p.from(src).to(dest);

			// pump data
			p.pump();

			// data should have been pumped correctly
			should(dest.destKeyA).be.undefined;	// keyA is drain only
			dest.destKeyB.should.eql(src.keyB);	// keyB is both
			dest.destKeyC.should.eql(src.keyC); // keyC is pump only

			// attempt to drain.
			// set some values on the destination
			dest.destKeyA = 'destValueA';
			dest.destKeyB = 'destValueB';
			dest.destKeyC = 'destValueC';

			p.drain();

			// src keyC should remain untouched
			src.keyA.should.eql('destValueA');	// keyA is drain only
			src.keyB.should.eql('destValueB');	// keyB is both
			src.keyC.should.eql('srcValueC');	// keyC is pump only

		});
	});
});
