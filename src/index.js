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

	var build   = require('./__pipe/build-actions');


	var pipe = module.exports = subject({
		initialize: function initialize(source, destination, actions) {


			this.source      = source;
			this.destination = destination;
			this.actions     = build.call(this, actions);
		},
	});
});
