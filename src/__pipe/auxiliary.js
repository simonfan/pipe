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
	 * @param  {[type]} str [description]
	 * @return {[type]}            [description]
	 */
	exports.wildcard = function wildcard(str) {

		var matcher;

		if (str.match(wildcardMatcher)) {
			// wildcard

			matcher = str.replace(wildcardMatcher, '.*');
			matcher = new RegExp(matcher);

		} else {
			// not wildcard
			matcher = str;
		}

		return matcher;
	};


});
