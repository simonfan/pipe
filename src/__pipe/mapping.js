/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var _ = require('lodash');

	/**
	 * Defines destination(s)
	 *
	 * @param  {[type]} destinations [description]
	 * @return {[type]}              [description]
	 */
	exports.to = function pipeTo(destinations) {
		destinations = _.isArray(destinations) ? destinations : [destinations];

		this.destinations = destinations;

		return this;
	};

	exports.rmDestination = function pipeRmDestination(name) {

	};

	/**
	 * Defines the source.
	 *
	 * @param  {[type]} source [description]
	 * @return {[type]}        [description]
	 */
	exports.from = function pipeFrom(source) {
		// restart cache
		this.cache = {};

		this.source = source;

		return this;
	};

});
