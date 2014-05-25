/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');


	/**
	 * Used for communication between methods defined in this module.
	 * Essentially for caching.
	 *
	 * @type {Object}
	 */
	var __closure = {
		cacheTmp: {}
	};

	/**
	 * Runs a single pipe function with a single key.
	 * Passes only one argument, the value.
	 *
	 * @param  {[type]}   source [description]
	 * @param  {Function} fn     [description]
	 * @param  {[type]}   key    [description]
	 * @return {[type]}          [description]
	 */
	function execExactKeyPipe(source, fn, key) {
		// get value
		var value = source[key];

		// set value to cache
		// ONLY WHEN ALL PIPES HAVE BEEN RUN.
		__closure.cacheTmp[key] = value;

		return fn(value);
	}


	/**
	 * Runs a single pipe function
	 * For a wildcard key.
	 *
	 * The difference is the this runner passes the
	 * key as first argument.
	 *
	 * [execWildcardKeyPipe description]
	 * @param  {[type]}   source [description]
	 * @param  {Function} fn     [description]
	 * @param  {[type]}   key    [description]
	 * @return {[type]}          [description]
	 */
	function execWildcardKeyPipe(source, fn, key) {
		// get value
		var value = source[key];

		// set value to cache
		// ONLY WHEN ALL PIPES HAVE BEEN RUN.
		__closure.cacheTmp[key] = value;

		return fn(key, value);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the source object.
	 *
	 * [execPipeLine description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	function execPipeLine(def, name) {

		var source  = this.source,
			matcher = def.matcher,
			fn      = def.fn,
			res     = [];

		if (_.isString(matcher) && this.changed(matcher)) {
			// exact key

			res.push(execExactKeyPipe(source, fn, matcher));

		} else if (_.isRegExp(matcher)) {
			// wildcard key

			// loop through source object ALL properties
			// (including inherited)
			for (var key in source) {

				// exec pipe for keys that match the matcher
				if (matcher.test(key) && this.changed(key)) {
					res.push(execWildcardKeyPipe(source, fn, key))
				}

			}
		}

		return res.length === 1 ? res[0] : q.all(res);
	}





	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	exports.push = function push(lines) {

		var defer = q.defer();

		// pick the lines to be executed.
		// defaults to ALL
		lines = lines ? _.pick(this.lines, lines) : this.lines;

		// execute pipelines
		var results = _.map(lines, execPipeLine, this);

		// update cache
		_.assign(this.cache, __closure.cacheTmp);
		__closure.cacheTmp = {};

		q.all(results).done(function () {
			// resolve with no arguments.
			defer.resolve();
		});

		return defer.promise;
	};

	/**
	 * Sets data onto source AND pushes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data) {

		_.assign(this.source, data);

		return this.push();
	};
});
