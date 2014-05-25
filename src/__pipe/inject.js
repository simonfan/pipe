/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');

	function fnAction(fn, actionName) {
		// actionName is actually the sourceKey

	}


	function objectAction(action, actionName) {
		if (action.regexp) {

		}
	}


	function execAction(action, actionName) {

		if (_.isFunction(action)) {
			return fnAction.call(this, action, actionName);
		} else if (_.isObject(action)) {
			return objectAction.call(this, action, actionName);
		}
	}


	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	module.exports = function inject() {

		// actions: { actionName: what to do with value.. }
		_.each(this.actions, function (action, name) {

			// [2] inject
			injectValue.call(this, sourceKey, value, action);

		});

	};
});
