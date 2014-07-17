/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * runs action with lines.
	 *
	 * @param  {Function} fn    [description]
	 * @param  {[type]}   lines [description]
	 * @return {[type]}         [description]
	 */
	function streamPipeline(streamFn, properties, force) {

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(this._map, properties) : this._map;

		// [3] call the streamFn for all lines.
		_.each(properties, function (destProps, srcProp) {

			// run the action
			streamFn.call(this, srcProp, destProps, force);

		}, this);

		// [4] return this.
		return this;
	}

	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	exports.pump = _.partial(streamPipeline, require('./pump'));

	/**
	 * [drain description]
	 * @type {[type]}
	 */
	exports.drain = _.partial(streamPipeline, require('./drain'));

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
