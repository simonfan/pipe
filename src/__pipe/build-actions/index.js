/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');

	var actionMatcher = require('./action-matcher');

	///////////
	// ARRAY //
	///////////

	/**
	 * Invokes a list of functions.
	 * @param  {[type]} fns   [description]
	 * @return {[type]}       [description]
	 */
	function invokeFns(fns) {

		var args = Array.prototype.slice.call(arguments, 1);

		var results = _.map(fns, function (fn) {
			return fn.apply(this, args);
		});

		// return promise
		return q.all(results);
	}

	/**
	 * Converts an array of action definitions and returns a function.
	 *
	 * @param  {[type]} subActions [description]
	 * @param  {[type]} actionName [description]
	 * @return {[type]}            [description]
	 */
	function arrayActionFn(subActions, actionName) {

		var fns = _.map(subActions, function (action, index) {
			// invoke build action
			return actionFn.call(this, action, actionName);

		}, this);

		// return a function that executes all subActions in order
		return _.partial(invokeFns, fns);
	}

	///////////
	// ARRAY //
	///////////




	////////////
	// STRING //
	////////////
	function set(object, value, sourceKey) {
		object[sourceKey] = value;
	}

	/**
	 *
	 * @param  {[type]} action     [description]
	 * @param  {[type]} actionName [description]
	 * @return {[type]}            [description]
	 */
	function stringActionFn(action, actionName) {

		// [1] check if there is a method on the destination
		//     corresponding to the action defined
		if (this.destination[action] && _.isFunction(this.destination[action])) {

			// method mapping
			return _.bind(this.destination[action], this.destination);
		} else {

			// property setting.
			return _.partial(set, this.destination);
		}


	}

	/**
	 * Given an action of any format,
	 * returns a function to be executed.
	 *
	 * @param  {[type]} action     [description]
	 * @param  {[type]} actionName [description]
	 * @return {[type]}            [description]
	 */
	function actionFn(action, actionName) {
		if (_.isString(action)) {
			// invoke destination method.
			return stringActionFn.call(this, action, actionName);

		} else if (_.isArray(action)) {
			// multiple actions
			return arrayAction.call(this, action, actionName);

		} else if (_.isFunction(action)) {
			return action;
		}
	}

	/**
	 * Takes a hash of actions and returns an array of action objects.
	 *
	 * @param  {[type]} actions [description]
	 * @return {[type]}         [description]
	 */
	module.exports = function buildActions(actions) {
		return _.map(actions, function (action, actionName) {

			return {
				fn     : actionFn.call(this, action, actionName),
				matcher: actionMatcher(actionName)
			};

		}, this);
	};
});
