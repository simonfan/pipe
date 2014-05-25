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

	var subject = require('subject');

	var buildActions = require('./__pipe/build-actions/index');

	var pipe = module.exports = subject({
		initialize: function initialize(source, destination, actions) {

			this.source      = source;
			this.cache       = {};

			this.destination = destination;
			this.actions     = buildActions.call(this, actions);
		},
	});

	pipe.assignProto(require('./__pipe/stream-control'))
});
