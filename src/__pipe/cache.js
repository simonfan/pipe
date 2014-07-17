/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	exports.clearCache = function clearCache() {
		this.cache = {};

		return this;
	};

	/**
	 * Does two things:
	 * [1] checks if the value is the same that is in cache
	 * (and return at end of execution)
	 * [2] if different, sets the value
	 *
	 * @param  {[type]} property [description]
	 * @param  {[type]} value    [description]
	 * @return {[type]}          [description]
	 */
	exports.isCached = function isCached(property, value) {
		if (!this.cache) {

			// no cache, always return false
			return false;

		} else {

			if (this.cache[property] !== value) {

				// set cache value
				this.cache[property] = value;

				// value not in cache
				return false;
			} else {
				// values are equal
				// value in cache
				return true;
			}
		}
	};

});
