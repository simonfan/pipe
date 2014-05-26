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

	/**
	 * [addDestinations description]
	 * @param {[type]} destinations [description]
	 */
	exports.addDestinations = function pipeAddDestination(destinations) {

		destinations = _.isArray(destinations) ? destinations : [destinations];

		this.destinations = this.destinations.concat(destinations);

		return this;

	};

	/**
	 * [rmDestinations description]
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} context  [description]
	 * @return {[type]}          [description]
	 */
	exports.rmDestinations = function pipeRmDestination(criteria, context) {

		this.destinations = _.remove(this.destinations, criteria, context);

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
		this.cache = {
			src: {},
			dest: {}
		};

		this.source = source;

		return this;
	};

});
