/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * Sets data onto src AND pumpes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data, force) {

		// [0] throw error if there is no src in the pipe object.
		if (!this.src) {
			throw new Error('No src for pipe');
		}

		// [1] SET all data onto the SOURCE
		_.each(data, function (value, key) {

			if (!this.isCached(key, value) || force) {
				this._srcSet(this.src, key, value);
			}

		}, this);

		// [2] pump data (no specific pipelines, force = true)
		this.pump(null, true);
	};
});