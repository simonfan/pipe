/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');


	/**
	 * Maps a single.
	 *
	 * @param  {[type]} src  [description]
	 * @param  {[type]} dest [description]
	 * @param  {[type]} type [description]
	 * @return {[type]}      [description]
	 */
	function mapSingle(src, destKey, options) {

		// grab direction
		var direction = (options && options.direction) ? options.direction : 'both';

		// force destKey into array format
		destKey = _.isArray(destKey) ? destKey : [destKey];

		if (direction && direction !== 'both') {

			// specific map
			this.maps[direction][src] = destKey;

		} else {

			// set map on both
			this.maps.to[src]    = destKey;
			this.maps.from[src]  = destKey;
		}
	};

	/**
	 * [map description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.map = function mapAttrs() {

		// args
		var args = _.toArray(arguments);

		// parse out options
		if (_.isString(arguments[0])) {

			// map
			mapSingle.apply(this, args);

		} else if (_.isObject(arguments[0])) {

			var options = arguments[1];

			// loop through map definition
			_.each(arguments[0], function (destKey, src) {
				// invoke map single method.
				mapSingle.call(this, src, destKey, options);

			}, this);
		}

		return this;
	};

	/**
	 * [unmap description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.unmap = function unmapAttribute(name) {
		_.each(this.maps, function (map) {
			delete map[name];
		});

		return this;
	};
});
