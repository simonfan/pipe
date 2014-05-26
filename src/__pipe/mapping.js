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
		this.clearCache();

		destinations = _.isArray(destinations) ? destinations : [destinations];

		this.destinations = destinations;

		return this;
	};

	/**
	 * [addDestination description]
	 * @param {[type]} destinations [description]
	 */
	exports.addDestination = function pipeAddDestination(destinations) {
		this.clearCache();

		// convert added destinations to array.
		destinations = _.isArray(destinations) ? destinations : [destinations];

		if (!this.destinations) {
			// create a destinations object if none is set.
			this.destinations = [];
		}

		// add new destinations to old ones.
		this.destinations = this.destinations.concat(destinations);

		return this;

	};

	/**
	 * [removeDestination description]
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} context  [description]
	 * @return {[type]}          [description]
	 */
	exports.removeDestination = function pipeRmDestination(criteria, context) {
		this.clearCache();

		_.remove(this.destinations, criteria, context);

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
