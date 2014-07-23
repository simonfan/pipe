/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	exports.drain = function drain() {

		var first  = arguments[0],
			second = arguments[1];

		var properties,
			options;


		// [1] get the map.
		var map  = this.maps.from;

		// [2] parse arguments
		if (_.isArray(first)) {
			// arguments: [properties, options]
			properties = _.pick(map, first);
			options    = second;

		} else if (_.isString(first)) {
			// arguments: [property, options]
			properties = {};
			properties[first] = map[first];
			options    = second;

		} else {
			// arguments: [options]
			properties = map;
			options    = first;

		}

		// default options
		options = options || {};

		var force = options.force;

		// source and destination in cache.
		var src  = this.src,
			dest = this.dest;

		// [3]
		_.each(properties, function (destProps, srcProp) {

			// [1] GET value from the first DESTINATION (dests[0])
			var value = this.destGet(this.dest, destProps[0]);

			// [2] check cache
			if (force || !this.cacheCheck(srcProp, value)) {
				// [2.1] SET value onto SOURCE
				this.srcSet(this.src, srcProp, value);

				// // [2.2] SET value onto source cache
				// this.cacheSet('src', srcProp, value);
			}

		}, this);


		// return this
		return this;
	};
});
