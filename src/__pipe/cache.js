/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	// exports.clearCache = function clearCache() {
	// 	this.cache = {};

	// 	return this;
	// };

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



	exports.cacheGet = function cacheGet(namespace, property) {
		return this.cache[namespace][property];
	};

	exports.cacheSet = function cacheSet(namespace, property, value) {

		this.cache[namespace][property] = value;

		return this;
	};

	exports.cacheCheck = function cacheCheck(namespace, property, value) {

		if (this.cache === false) {
			// no cache.
			// always return false on checks.
			return false;
		}

		return this.cacheGet(namespace, property) === value;

	};

	exports.cacheClear = function cacheClear(namespace, properties) {
		if (arguments.length === 0) {
			// full clear.
			this.cache = {
				src: {},
				dest: {}
			};

		} else if (arguments.length === 1) {
			// arguments: [namespace]
			this.cache[namespace] === {};

		} else {
			// arguments: [namespace, propertyOrProperties]

			// properties must be array
			properties = _.isArray(properties) ? properties : [properties];

			// direct reference to the cache obj
			var cache = this.cache[namespace];

			_.each(properties, function (property) {
				delete cache[property]
			}, this);
		}

		return this;
	};

});
