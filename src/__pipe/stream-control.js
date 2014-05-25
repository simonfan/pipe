/* jshint ignore:start */
if (typeof define !== 'function') { var define = require('amdefine')(module) }
/* jshint ignore:end */

define(function (require, exports, module) {
	'use strict';


	var _ = require('lodash'),
		q = require('q');

	/**
	 * Runs a single action
	 * testing its matcher across all properties of the source object.
	 *
	 * [execAction description]
	 * @param  {[type]} action [description]
	 * @return {[type]}        [description]
	 */
	function execAction(action) {

		var source  = this.source,
			matcher = action.matcher,
			fn      = action.fn,
			res     = [];

		if (_.isString(matcher)) {
			// exact key

			var value = source[matcher];
			// execute the action fn passing
			// the source[matcher] as argument
			res.push(fn(value, matcher));

		} else if (_.isRegExp(matcher)) {
			// wildcard key

			// loop through source object ALL properties (including inherited)
			for (var key in source) {
				if (matcher.test(key)) {

					var value = source[key];

					// if the matcher regexp effectively matches
					// the key, execute the fn passign the source[key]
					// value as first argument.
					res.push(fn(value, key));
				}
			}
		}

		return res.length === 1 ? res[0] : q.all(res);
	}

	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	function inject() {

		// actions: { actionName: what to do with value.. }
		var results = _.map(this.actions, execAction, this);

		return q.all(results);
	}

	exports.inject = inject;
	exports.pump   = inject;
	exports.push   = inject;
});
