(function(name, factory) {

	var mod = typeof define !== 'function' ?
		// node
		'../src/__pipe/build-actions/action-matcher' :
		// browser
		'__pipe/build-actions/action-matcher',
		// dependencies for the test
		deps = [mod, 'should'];

	if (typeof define !== 'function') {
		// node
		factory.apply(null, deps.map(require));
	} else {
		// browser
		define(deps, factory);
	}

})('test', function(actionMatcher, should) {
	'use strict';

	describe('actionMatcher action-matcher', function () {

		it('plain key (noAsteriskKey)', function () {

			actionMatcher('someKey').should.eql('someKey');

		});

		it('wildcard at end key (prefix*)', function () {
			var matcher = actionMatcher('someKey*');

			matcher.test('someKeyWhatever').should.be.true;
			matcher.test('someOtherKeyWhatever').should.be.false;
		});

		it('wildcard at beginning key (*Suffix)', function () {
			var matcher = actionMatcher('*SomeKey');

			matcher.test('whateverSomeKey').should.be.true;
			matcher.test('SomeKey').should.be.true;
			matcher.test('whateverSomeOtherKey').should.be.false;
		});

		it('wildcard in middle key (prefix*Suffix)', function () {
			var matcher = actionMatcher('prefix*Suffix');

			matcher.test('prefixWhateverSuffix').should.be.true;
			matcher.test('prefixWhatever').should.be.false;
			matcher.test('whateverSuffix').should.be.false;
		});

		it('beginning and end (*Middle*)', function () {

			var matcher = actionMatcher('*Middle*');

			matcher.test('whateverMiddleEnd').should.be.true;
			matcher.test('whateverNomiddleEnd').should.be.false;

		});

		it('whatever (*)', function () {
			var matcher = actionMatcher('*');

			matcher.test('anything').should.be.true;


			matcher.test('whateverMiddleEnd').should.be.true;
			matcher.test('whateverNomiddleEnd').should.be.true;


			matcher.test('prefixWhateverSuffix').should.be.true;
			matcher.test('prefixWhatever').should.be.true;
			matcher.test('whateverSuffix').should.be.true;
		})
	});
});
