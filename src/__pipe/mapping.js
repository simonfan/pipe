/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * Defines destination
	 *
	 * @param  {[type]} destination [description]
	 * @return {[type]}             [description]
	 */
	exports.to = function pipeTo(destination) {
		this.clearCache();

		this.destination = destination;

		return this;
	};



	/**
	 * Defines the source.
	 *
	 * @param  {[type]} source [description]
	 * @return {[type]}        [description]
	 */
	exports.from = function pipeFrom(source) {
		// restart cache
		this.clearCache();

		this.source = source;

		return this;
	};

});
