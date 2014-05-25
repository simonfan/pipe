/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var aux    = require('../auxiliary'),
		// the fn parser
		lineFn = require('./fn');


	/**
	 * [line description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.line = function pipeLine() {

		var name, definition;

		if (arguments.length === 1) {
			// arguments: [definition]
			name       = '*';
			definition = arguments[0];
		} else {
			name       = arguments[0];
			definition = arguments[1];
		}

		// save the line to the lines object hash
		this.lines[name] = {
			fn     : lineFn.call(this, definition, name),
			matcher: aux.wildcard(name),
		};


		return this;
	};
	// alias.
	exports.pipeline = exports.line;

	/**
	 * [rmLine description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.rmLine = function rmPipeLine(name) {
		delete this.lines[name];

		return this;
	};
});
