/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';

	var wildcardMatcher = /\*/g;

	/**
	 * Checks whether the name accepts wildcards.
	 * If so, returns a regexp.
	 * Otherwise, return a string, for exact matching.
	 *
	 * @param  {[type]} actionName [description]
	 * @return {[type]}            [description]
	 */
	module.exports = function actionMatcher(actionName) {

		var matcher;

		if (actionName.match(wildcardMatcher)) {
			// wildcard

			matcher = actionName.replace(wildcardMatcher, '.*');
			matcher = new RegExp(matcher);

		} else {
			// not wildcard
			matcher = actionName;
		}

		return matcher;
	};


});
