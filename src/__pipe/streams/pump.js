/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash');


	/**
	 * SINGLE DESTINATION
	 *
	 * @param  {[type]} value       [description]
	 * @param  {[type]} dest [description]
	 * @param  {[type]} properties  [description]
	 * @return {[type]}             [description]
	 */
	function pumpValue(value, dest, properties) {


		_.each(properties, function (prop) {

			// [2.1.1.1] SET value onto DESTINATION
			return this._destSet(dest, prop, value);

		}, this);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the src object.
	 *
	 * [pumpPipe description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	module.exports = function pumpPipeline(srcProp, destProps, force) {


		var dest = this.dest;


		// [1] GET value from SOURCE
		var value = this._srcGet(this.src, srcProp);

		// [2] SET value
		// [2.1] check if cached value is the same as current value
		if (!this.isCached(srcProp, value) || force) {

			// [2.2] pump values.
			pumpValue.call(this, value, dest, destProps);
		}
	};
});
