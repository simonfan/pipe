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

	describe('pipe cache', function () {

		it('is fine (:', function () {

			var src  = {
					k1: 'src1',
					k2: 'src2',
					k3: 'src3'
				},
				dest = {
					destK1: 'dest1',
					destK2: 'dest2',
					destK3: 'dest3'
				};

			var p = pipe(src, dest);

			// define a 'from'-only map.
			// which means: a map that can only be pumped.
			// data should not be capable of coming back.
			p.map({
				k1: 'destK1',
				k2: 'destK2',
				k3: 'destK3'
			}, 'from');

			p.pump();

			dest.destK1.should.eql('dest1');
			dest.destK2.should.eql('dest2');
			dest.destK3.should.eql('dest3');

			// attempt drain
			p.drain();


			src.k1.should.eql('dest1');
			src.k2.should.eql('dest2');
			src.k3.should.eql('dest3');

			// set values on SOURCE
			// and drain again
			src.k1 = 'src1-modified';
			src.k2 = 'src2-modified';
			src.k3 = 'src3-modified';

			// drain again
			p.drain();

			src.k1.should.eql('src1-modified', 'src remains unmodified, as the dest has not changed');
			src.k2.should.eql('src2-modified');
			src.k3.should.eql('src3-modified');


			// drain using force option
			p.drain({ force: true });

			src.k1.should.eql('dest1');
			src.k2.should.eql('dest2');
			src.k3.should.eql('dest3');
		});
	});
});
