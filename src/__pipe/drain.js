/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	exports.drain = function drain(properties, force) {

		// [1] keep properties in cache.
		var map  = this.maps.drain,
			src  = this.src,
			dest = this.dest;

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(map, properties) : map;

		// [3]
		_.each(properties, function (destProps, srcProp) {


			// [1] GET value from the first DESTINATION (dests[0])
			var value = this._destGet(this.dest, destProps[0]);

			// [2] check cache
			if (!this.isCached(srcProp, value) || force) {
				// [2.1] SET value onto SOURCE
				this._srcSet(this.src, srcProp, value);
			}

		}, this);


		// return this
		return this;
	};
});
