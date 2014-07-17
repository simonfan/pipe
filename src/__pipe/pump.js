/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');


	exports.pump = function pump(properties, force) {
		// [1] keep properties in cache.
		var map  = this.maps.pump,
			src  = this.src,
			dest = this.dest;

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(map, properties) : map;

		// [3]
		_.each(properties, function (destProps, srcProp) {

			// [3.1] GET value from SOURCE
			var value = this._srcGet(src, srcProp);

			// [3.2] SET value
			// [3.2.1] check if cached value is the same as current value
			if (!this.isCached(srcProp, value) || force) {

				// [3.2.2] pump values.
				_.each(destProps, function (prop) {

					return this._destSet(dest, prop, value);

				}, this);
			}


		}, this);

	};
});
