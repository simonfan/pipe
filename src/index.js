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


	var extensionOptionNames = ['get', 'set', 'srcGet', 'srcSet', 'destGet', 'destSet'];

	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} mappings [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(mappings, options) {

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

			if (options.from) {
				this.from(options.from);
			}

			if (options.to) {
				this.to(options.to);
			}

			// object on which mappings will be stored.
			this.maps = {
				drain: {},
				pump : {}
			};
			this.map(mappings);
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
			this.clearCache();
			// set
			this.src = src;
			return this;
		},

		to: function pipeTo(dest) {
			this.clearCache();
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
