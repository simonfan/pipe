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

		var defer = q.defer();

		// pick the lines to be executed.
		// defaults to ALL
		lines = lines ? _.pick(this.lines, lines) : this.lines;

		var results = _.map(lines, function (destProps, srcProp) {

			// run the action
			streamFn.call(this, srcProp, destProps);

		}, this);

		q.all(results).done(function () {
			// resolve with no arguments.
			defer.resolve();
		});

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

		var get = this.srcGet || this.get,
			set = this.destSet || this.set;

		var value = get.call(this, this.source, srcProp);

		if (value !== this.cache.src[srcProp]) {
			// if value is different from the one in cache
			// do setting

			var res = _.map(destProps, function (prop) {

				var setPropRes = _.map(this.destinations, function (destination) {
					return set.call(this, destination, prop, value);
				}, this);

				q.all(setPropRes);

			}, this);


			// set value to cache
			// ONLY WHEN ALL PIPES HAVE BEEN RUN.
			this.cache.src[srcProp] = value;

			return q.all(res)
		}
	}



	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	function drainPipeline(srcProp, destProps) {

		var get = this.destGet || this.get,
			set = this.srcSet || this.set;

		var value = get.call(this, this.destinations[0], destProps[0]);

			// check cache
		if (value !== this.cache.dest[destProps]) {
			return set.call(this, source, prop, value);
		}
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

		var set    = this.srcSet || this.set,
			source = this.source;

		if (!source) {
			throw new Error('No source for pipe');
		}

		var setRes = _.map(data, function (value, key) {

			return set.call(this, source, key, value);

		}, this);

		return q.all(setRes)
				.then(_.bind(function () {
					return this.pump();
				}, this), function (e) {
					throw e;
				});
	};
});
