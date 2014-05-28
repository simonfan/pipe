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


	var extensionOptionNames = ['srcGet', 'srcSet', 'destGet', 'destSet'];

	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} mappings [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(lines, options) {

			options = options || {};

			// some default options
			_.each(extensionOptionNames, function (opt) {
				this[opt] = options[opt] || this[opt];
			}, this);

			// _*get and _*set methods.
			this._srcGet = this.srcGet || this.get;
			this._srcSet = this.srcSet || this.set;
			this._destGet = this.destGet || this.get;
			this._destSet = this.destSet || this.set;

			// the cache. if set to false, no cache will be used.
			if (options.cache !== false) {
				this.clearCache();
			}

			if (options.source) {
				this.from(options.source);
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

		srcGet:
		srcSet

		destGet:
		destSet:
	*/


		clearCache: function clearCache() {
			this.cache = {};

			return this;
		},

		/**
		 * Does two things:
		 * [1] checks if the value is the same that is in cache
		 * (and return at end of execution)
		 * [2] if different, sets the value
		 *
		 * @param  {[type]} property [description]
		 * @param  {[type]} value    [description]
		 * @return {[type]}          [description]
		 */
		isCached: function isCached(property, value) {
			if (!this.cache) {

				// no cache, always return false
				return false;

			} else {

				if (this.cache[property] !== value) {

					// set cache value
					this.cache[property] = value;

					// value not in cache
					return false;
				} else {
					// values are equal
					// value in cache
					return true;
				}
			}

		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/streams/index'))
		.assignProto(require('./__pipe/line'));
});
