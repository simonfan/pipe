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
		 * @param  {[type]} mappings [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(lines, options) {

			options = options || {};

			// the cache. if set to false, no cache will be used.
			this.cache = options.cache === false ? false : {
				src: {},
				dest: {},
			};

			if (options.source) {
				this.from(source);
			}

			if (options.destination) {
				this.to(options.destination);
			}

			// object on which line mappings will be stored.
			this.lines = {};
			this.line(lines);
		},

		get: function pipeGet(object, property) {
			return object[property];
		},

		set: function pipeSet(object, property, value) {
			object[property] = value;

			return object;
		},

/*

	exports.srcGet
	exports.srcSet

	exports.destGet
	exports.destSet
*/

	});

	// prototype
	pipe.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/streams'))
		.assignProto(require('./__pipe/line'));
});
