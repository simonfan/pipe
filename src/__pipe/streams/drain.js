/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash');

	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	module.exports = function drainPipeline(srcProp, destProps, force) {

		// [1] GET value from the first DESTINATION (destinations[0])
		var value = this._destGet(this.destination, destProps[0]);

		// [2] check cache
		if (!this.isCached(srcProp, value) || force) {
			// [2.1] SET value onto SOURCE
			this._srcSet(this.source, srcProp, value);
		}

		return this;
	};

});
