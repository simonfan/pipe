/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash'),
		q = require('q');

	/**
	 * runs action with lines.
	 *
	 * @param  {Function} fn    [description]
	 * @param  {[type]}   lines [description]
	 * @return {[type]}         [description]
	 */
	function streamPipeline(streamFn, lines) {

		// [1] create a deferred object.
		var defer = q.defer();

		// [2] pick the lines to be executed.
		//     defaults to ALL
		lines = lines ? _.pick(this.lines, lines) : this.lines;

		// [3] call the streamFn for all lines.
		var results = _.map(lines, function (destProps, srcProp) {

			// run the action
			return streamFn.call(this, srcProp, destProps);

		}, this);

		// [4] resolve the deferred object with NO VALUES
		//     when all the streamFn invocations have been completed.
		q.all(results).done(function () {
			// resolve with no arguments.
			defer.resolve();
		});

		// [5] return the promise.
		return defer.promise;
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
	 * Sets data onto source AND pumpes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data) {

		// [0] throw error if there is no source in the pipe object.
		if (!this.source) {
			throw new Error('No source for pipe');
		}

		// [1] SET all data onto the SOURCE
		var srcSetRes = _.map(data, function (value, key) {

			return this._srcSet(this.source, key, value);

		}, this);


		// [2] wait for all srcSets
		return q.all(srcSetRes).then(

			// [2.1] then invoke pump on success
			//       wrap in a method in order to guarantee
			//       pump is invoked with NO ARGUMENTS
			_.bind(function() { this.pump(); }, this),

			// [2.2] or throw error
			function (e) { throw e; }
		);
	};
});
