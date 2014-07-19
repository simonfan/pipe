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
		 * @param  {[type]} map [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(src, dest, map, options) {

			options = options || {};

			// getters and setters
			this.srcGet  = this.srcGet  || this.get;
			this.srcSet  = this.srcSet  || this.set;
			this.destGet = this.destGet || this.get;
			this.destSet = this.destSet || this.set;

			// the cache. if set to false, no cache will be used.
			if (options.cache !== false) {
				this.cacheClear();
			}

			// object on which map will be stored.
			this.maps = {
				from: {},
				to  : {}
			};

			if (src) { this.from(src); }
			if (dest) { this.to(dest); }
			if (map) { this.map(map, options.direction); }
		},

		get: function pipeGet(object, property) {
			return object[property];
		},

		set: function pipeSet(object, property, value) {
			object[property] = value;

			return object;
		},

		/*
		srcGet:
		srcSet

		destGet:
		destSet:
		*/

		from: function pipeFrom(src) {
			// restart cache
			this.cacheClear();
			// set
			this.src = src;
			return this;
		},

		to: function pipeTo(dest) {
			this.cacheClear();
			// set
			this.dest = dest;
			return this;
		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/pump'))
		.assignProto(require('./__pipe/drain'))
		.assignProto(require('./__pipe/inject'))
		.assignProto(require('./__pipe/map'))
		.assignProto(require('./__pipe/cache'));
});
