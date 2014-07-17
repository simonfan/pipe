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
	function mapSingleAttribute(src, dest, direction) {

		// force dest into array format
		dest = _.isArray(dest) ? dest : [dest];

		if (direction && direction !== 'both') {

			// specific map
			this.maps[direction][src] = dest;

		} else {

			// set map on both
			this.maps.to[src]    = dest;
			this.maps.from[src]  = dest;
		}
	}


	/**
	 * [map description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.map = function mapAttribute() {

		if (_.isString(arguments[0])) {

			// map
			mapSingleAttribute.apply(this, arguments);

		} else if (_.isObject(arguments[0])) {
			// arguments = [{
			// 		src: {
			// 			dest: 'destAttribute',
			// 			direction: 'dual' || 'drain' || 'pump'
			// 		},
			// 		src: 'destAttribute'  (direction = 'dual')
			// }]

			var direction = arguments[1];

			_.each(arguments[0], function (destDef, src) {

				var dest;

				if (_.isString(destDef)) {
					dest      = destDef;
				} else {
					dest      = destDef.dest;
					direction = destDef.direction || direction;
				}

				// invoke map method.
				mapSingleAttribute.call(this, src, dest, direction);

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
