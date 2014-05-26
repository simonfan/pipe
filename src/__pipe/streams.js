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
			streamFn.call(this, srcProp, destProps);

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
	 * Runs a single line
	 * testing its matcher across all properties of the source object.
	 *
	 * [pumpPipe description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	function pumpPipeline(srcProp, destProps) {

		// [1] GET value from SOURCE
		var value = this._srcGet(this.source, srcProp);

		// [2] check if cached value is the same as
		//     current value
		if (value !== this.cache.src[srcProp]) {
			// if value is different from the one in cache
			// do setting

			// [2.1] set destination properties
			var res = _.map(destProps, function (prop) {

				// [2.1.1] set on all destinations
				var destSetRes = _.map(this.destinations, function (destination) {

					// [2.1.1.1] SET value onto DESTINATION
					return this._destSet(destination, prop, value);
				}, this);

				// [2.1.2] return a promise for
				//         when all destination-settings are done.
				return q.all(destSetRes);

			}, this);


			// [3] set value to cache
			this.cache.src[srcProp] = value;

			// [4] return a promise for when all property-settings are done.
			return q.all(res);
		}

		// else: return undefined.
	}



	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	function drainPipeline(srcProp, destProps) {

		// [1] GET value from the first DESTINATION (destinations[0])
		var value = this._destGet(this.destinations[0], destProps[0]);

		// [2] check cache
		if (value !== this.cache.dest[destProps]) {

			// [2.1] SET value onto SOURCE
			return this._srcSet(this.source, srcProp, value);
		}

		// else: return undefined
	}


	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	exports.pump = _.partial(streamPipeline, pumpPipeline);

	/**
	 * [drain description]
	 * @type {[type]}
	 */
	exports.drain = _.partial(streamPipeline, drainPipeline);

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
