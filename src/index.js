//     pipe
//     (c) simonfan
//     pipe is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module pipe
 */

/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var subject = require('subject'),
		_       = require('lodash');


	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} pipelines [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(pipelines, options) {

			options = options || {};

			this.source = {};
			if (options.source) {
				this.from(source);
			}

			if (options.destination) {
				this.to(options.destination);
			}

			// the cache. if set to false, no cache will be used.
			this.cache = options.cache === false ? false : {};

			// object on which pipelines will be stored.
			this.lines = {};
			// build pipelines
			_.each(pipelines, function (pipeline, name) {

				this.line(name, pipeline);

			}, this);
		},


		/**
		 * Checks if a property has uncached changes on the source
		 *
		 * @param  {[type]} prop [description]
		 * @return {[type]}      [description]
		 */
		changed: function changed(prop) {
			return this.source[prop] !== this.cache[prop];
		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/stream-control'))
		.assignProto(require('./__pipe/line/index'));
});
