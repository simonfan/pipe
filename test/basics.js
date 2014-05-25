(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'.././src' :
		// browser
		'pipe',
		// dependencies for the test
		deps = [mod, 'should', 'lodash'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(pipe, should, _) {
	'use strict';

	describe('pipe basics', function () {

		it('demo', function () {

			function set(object, key, value) {
				object[key] = value;
			}

			// create a destination object.
			var destination = {};

			destination.m1 = _.partial(set, destination, 'k1');
			destination.m2 = _.partial(set, destination, 'k2');
			destination.m3 = _.partial(set, destination, 'k3');
			destination.m4 = _.partial(set, destination, 'k4');


			destination.notifications = {};
			destination.notify = function notify(value, sourceKey) {
				this.notifications[sourceKey] = this.notifications[sourceKey] ?
					this.notifications[sourceKey].concat(value) :
					[value];
			};


			// create a source object
			var source = {};


			// instantiate
			// pipe(source, destination, map);
			// map: { keyOnSource: function (valueOnSource) {} }
			//      { keyOnSource: 'methodOnDestination' }
			//      { keyOnSource: { complex definition }}
			//      { keyOnSource: [multiple mappings for the same key] }
			var dataPipe = pipe(source, destination, {

				sourceK1: 'm1',
				sourceK2: 'm2',

				'source*': 'notify'
			});

			// set some data on source
			source.sourceK1 = 'value-1';
			source.sourceK2 = 'value-2';

			// execute
			dataPipe.inject();

			// check that destination methods were run.
			destination.k1.should.eql('value-1');
			destination.k2.should.eql('value-2');

			destination.notifications.sourceK1.should.eql(['value-1']);
			destination.notifications.sourceK2.should.eql(['value-2']);

			// change data and inject again
			source.sourceK1 = 'value-1-2';
			source.sourceK2 = 'value-2-2';
			dataPipe.inject();

			destination.k1.should.eql('value-1-2');
			destination.k2.should.eql('value-2-2');
			destination.notifications.should.eql({
				sourceK1: ['value-1', 'value-1-2'],
				sourceK2: ['value-2', 'value-2-2']
			});
		});
	});
});
