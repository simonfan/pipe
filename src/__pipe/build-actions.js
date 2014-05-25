/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');



	///////////
	// ARRAY //
	///////////

	function invokeSubActions(subFns, value) {

		var results = _.map(subFns, function (fn) {
			return fn(value);
		});

		// return promise
		return q.all(results);
	}

	function arrayAction(subActions, actionName) {

		var subFns = _.map(subActions, function (action, index) {

			// invoke build action
			buildAction.call(this, action, actionName);

		}, this);

		// return a function that executes all subActions in order
		return _.partial(invokeSubActions, subFns);
	}

	///////////
	// ARRAY //
	///////////



	function regexpAction(regexp,)




	function buildAction(action, actionName) {

		if (_.isString(action)) {

			// invoke destination method.
			action = _.bind(this.destination[action], this.destination);

		} else if (_.isArray(action)) {

			// multiple actions
			action = arrayAction.apply(this, arguments);

		}

		return action;

	}

	module.exports = function buildActions(actions) {
		return _.mapValues(actions, buildAction);
	};
});
