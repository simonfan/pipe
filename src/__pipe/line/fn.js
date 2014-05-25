/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');

	/**
	 * Invokes a list of functions.
	 * @param  {[type]} fns   [description]
	 * @return {[type]}       [description]
	 */
	function invokeFns(fns) {

		var args = Array.prototype.slice.call(arguments, 1);

		var results = _.map(fns, function (fn) {
			return fn.apply(this, args);
		});

		// return promise
		return q.all(results);
	}

	/**
	 * Converts an array of line definitions and returns a function.
	 *
	 * @param  {[type]} subLines [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function arrayLineFn(subLines, lineName) {

		var fns = _.map(subLines, function (line, index) {
			// invoke build line
			return lineFn.call(this, line, lineName);

		}, this);

		// return a function that executes all subLines in order
		return _.partial(invokeFns, fns);
	}



	/**
	 * [functionLineFn description]
	 * @param  {[type]} func     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}          [description]
	 */
	function functionLineFn(func, lineName) {
		return _.bind(function pipeFnLine() {

			// get invocation arguments
			var args = _.toArray(arguments);

			// invoke
			var results = _.map(this.destinations, function (destination) {

				// invoke the fn with destination as first argument.
				var lineArgs = [destination].concat(args);
				return func.apply(this, lineArgs);

			}, this);

			// return promise, as always.
			return q.all(results);

		}, this);
	}



	/**
	 * [0] full matched str
	 * [1] method
	 * [2] arguments
	 *
	 * [stringLineFnParse description]
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	var lineMatcher = /^\s*([^:]*)(?::(.*))?$/,
		argsSplit   = /\s*,\s*/g;

	function stringLineFnParse(str) {

		var match = str.match(lineMatcher);

		if (!match) {
			throw new Error('Invalid line definition for jquery-pipe.');
		}

		return {
			method: match[1],
			args  : match[2] ? match[2].split(argsSplit) : []
		};
	}


	/**
	 *
	 * @param  {[type]} stringLineStr     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function stringLineFn(stringLineStr, lineName) {

		var parsed = stringLineFnParse(stringLineStr);

		// [1] check if there is a method on the destination
		//     corresponding to the line defined
		return _.bind(function pipeInvokeMethodsOnDestinations() {

			// get invocation arguments
			var args = parsed.args.concat(_.toArray(arguments));

			// invoke methods on destinations.
			var results = _.map(this.destinations, function (destination) {
				// invoke method on the destination
				return destination[parsed.method].apply(destination, args);
			});

			// return promise, as always.
			return q.all(results);

		}, this);
	}



	/**
	 * Given an line of any format,
	 * returns a function to be executed.
	 *
	 * @param  {[type]} line     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function lineFn(line, lineName) {
		if (_.isString(line)) {
			// invoke destination method.
			return stringLineFn.call(this, line, lineName);

		} else if (_.isArray(line)) {
			// multiple lines
			return arrayLine.call(this, line, lineName);

		} else if (_.isFunction(line)) {
			return line;
		}
	}


	module.exports = lineFn;
});
