/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');

	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	module.exports = function drainPipeline(srcProp, destProps) {

		// [1] GET value from the first DESTINATION (destinations[0])
		return q(this._destGet(this.destination, destProps[0]))
			.then(_.bind(function (value) {
				// [2] check cache
				if (value !== this.cache.dest[destProps]) {

					// [2.1] SET value onto SOURCE
					return this._srcSet(this.source, srcProp, value);
				} // else: return undefined (solve immediately)
			}, this))
			.fail(function (e) { throw e; });

	};

});
