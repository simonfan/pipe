/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');


	/**
	 * SINGLE DESTINATION
	 *
	 * @param  {[type]} value       [description]
	 * @param  {[type]} destination [description]
	 * @param  {[type]} properties  [description]
	 * @return {[type]}             [description]
	 */
	function pumpValueToDestination(value, destination, properties) {


		var res = _.map(properties, function (prop) {

			// [2.1.1.1] SET value onto DESTINATION
			return this._destSet(destination, prop, value);

		}, this);

		return q.all(res);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the source object.
	 *
	 * [pumpPipe description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	module.exports = function pump(srcProp, destProps, force) {


		var destination = this.destination;

		// [1] GET value from SOURCE
		return q(this._srcGet(this.source, srcProp))
			// [2] promise then
			.then(_.bind(function (value) {

				// [2.1] check if cached value is the same as
				//       current value
				if (!this.isCached(srcProp, value) || force) {

					// [3] resolve pumpDefer agter
					//     value has been pumped to destination
					return pumpValueToDestination.call(this, value, destination, destProps)

				}// else return nothing, solve immediately

			}, this))
			.fail(function (e) { throw e; });
	};
});
