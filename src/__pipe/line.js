/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * [line description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.line = function pipeLine() {

		var src, dest;

		if (_.isString(arguments[0])) {

			// arguments = [src, dest]
			src  = arguments[0];
			dest = arguments[1] || src;

			// dest must be an array
			dest = _.isArray(dest) ? dest : [dest];

			// set line.
			this.lines[src] = dest;

		} else if (_.isObject(arguments[0])) {
			// arguments = [{ src: dest }]

			_.each(arguments[0], function (dest, src) {
				this.line(src, dest);
			}, this);

		}

		return this;
	};

	/**
	 * [removeLine description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.removeLine = function rmPipeLine(name) {
		delete this.lines[name];

		return this;
	};
});
