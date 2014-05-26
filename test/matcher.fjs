(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'../src/__pipe/auxiliary' :
		// browser
		'__pipe/auxiliary',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(aux, should) {
	'use strict';

	describe('aux.wildcard action-matcher', function () {

		it('plain key (noAsteriskKey)', function () {

			aux.wildcard('someKey').should.eql('someKey');

		});

		it('wildcard at end key (prefix*)', function () {
			var matcher = aux.wildcard('someKey*');

			matcher.test('someKeyWhatever').should.be.true;
			matcher.test('someOtherKeyWhatever').should.be.false;
		});

		it('wildcard at beginning key (*Suffix)', function () {
			var matcher = aux.wildcard('*SomeKey');

			matcher.test('whateverSomeKey').should.be.true;
			matcher.test('SomeKey').should.be.true;
			matcher.test('whateverSomeOtherKey').should.be.false;
		});

		it('wildcard in middle key (prefix*Suffix)', function () {
			var matcher = aux.wildcard('prefix*Suffix');

			matcher.test('prefixWhateverSuffix').should.be.true;
			matcher.test('prefixWhatever').should.be.false;
			matcher.test('whateverSuffix').should.be.false;
		});

		it('beginning and end (*Middle*)', function () {

			var matcher = aux.wildcard('*Middle*');

			matcher.test('whateverMiddleEnd').should.be.true;
			matcher.test('whateverNomiddleEnd').should.be.false;

		});

		it('whatever (*)', function () {
			var matcher = aux.wildcard('*');

			matcher.test('anything').should.be.true;


			matcher.test('whateverMiddleEnd').should.be.true;
			matcher.test('whateverNomiddleEnd').should.be.true;


			matcher.test('prefixWhateverSuffix').should.be.true;
			matcher.test('prefixWhatever').should.be.true;
			matcher.test('whateverSuffix').should.be.true;
		})
	});
});
