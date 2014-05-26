/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/mapping',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	/**
	 * Defines destination(s)
	 *
	 * @param  {[type]} destinations [description]
	 * @return {[type]}              [description]
	 */
	exports.to = function pipeTo(destinations) {
		destinations = _.isArray(destinations) ? destinations : [destinations];

		this.destinations = destinations;

		return this;
	};

	exports.rmDestination = function pipeRmDestination(name) {

	};

	/**
	 * Defines the source.
	 *
	 * @param  {[type]} source [description]
	 * @return {[type]}        [description]
	 */
	exports.from = function pipeFrom(source) {
		// restart cache
		this.cache = {};

		this.source = source;

		return this;
	};

});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/stream-control',['require','exports','module','lodash','q'],function (require, exports, module) {
	


	var _ = require('lodash'),
		q = require('q');


	/**
	 * Used for communication between methods defined in this module.
	 * Essentially for caching.
	 *
	 * @type {Object}
	 */
	var __closure = {
		cacheTmp: {}
	};

	/**
	 * Runs a single pipe function with a single key.
	 * Passes only one argument, the value.
	 *
	 * @param  {[type]}   source [description]
	 * @param  {Function} fn     [description]
	 * @param  {[type]}   key    [description]
	 * @return {[type]}          [description]
	 */
	function execExactKeyPipe(source, fn, key) {
		// get value
		var value = source[key];

		// set value to cache
		// ONLY WHEN ALL PIPES HAVE BEEN RUN.
		__closure.cacheTmp[key] = value;

		return fn(value);
	}


	/**
	 * Runs a single pipe function
	 * For a wildcard key.
	 *
	 * The difference is the this runner passes the
	 * key as first argument.
	 *
	 * [execWildcardKeyPipe description]
	 * @param  {[type]}   source [description]
	 * @param  {Function} fn     [description]
	 * @param  {[type]}   key    [description]
	 * @return {[type]}          [description]
	 */
	function execWildcardKeyPipe(source, fn, key) {
		// get value
		var value = source[key];

		// set value to cache
		// ONLY WHEN ALL PIPES HAVE BEEN RUN.
		__closure.cacheTmp[key] = value;

		return fn(key, value);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the source object.
	 *
	 * [execPipeLine description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	function execPipeLine(def, name) {

		var source  = this.source,
			matcher = def.matcher,
			fn      = def.fn,
			res     = [];

		if (_.isString(matcher) && this.changed(matcher)) {
			// exact key

			res.push(execExactKeyPipe(source, fn, matcher));

		} else if (_.isRegExp(matcher)) {
			// wildcard key

			// loop through source object ALL properties
			// (including inherited)
			for (var key in source) {

				// exec pipe for keys that match the matcher
				if (matcher.test(key) && this.changed(key)) {
					res.push(execWildcardKeyPipe(source, fn, key))
				}

			}
		}

		return res.length === 1 ? res[0] : q.all(res);
	}





	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	exports.push = function push(lines) {

		var defer = q.defer();

		// pick the lines to be executed.
		// defaults to ALL
		lines = lines ? _.pick(this.lines, lines) : this.lines;

		// execute pipelines
		var results = _.map(lines, execPipeLine, this);

		// update cache
		_.assign(this.cache, __closure.cacheTmp);
		__closure.cacheTmp = {};

		q.all(results).done(function () {
			// resolve with no arguments.
			defer.resolve();
		});

		return defer.promise;
	};

	/**
	 * Sets data onto source AND pushes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data) {

		_.assign(this.source, data);

		return this.push();
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/auxiliary',['require','exports','module'],function (require, exports, module) {
	

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

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/line/fn',['require','exports','module','lodash','q'],function (require, exports, module) {
	


	var _ = require('lodash'),
		q = require('q');

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
	 * Converts an array of line definitions and returns a function.
	 *
	 * @param  {[type]} subLines [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function arrayLineFn(subLines, lineName) {

		var fns = _.map(subLines, function (line, index) {
			// invoke build line
			return lineFn.call(this, line, lineName);

		}, this);

		// return a function that executes all subLines in order
		return _.partial(invokeFns, fns);
	}



	/**
	 * [functionLineFn description]
	 * @param  {[type]} func     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}          [description]
	 */
	function functionLineFn(func, lineName) {
		return _.bind(function pipeFnLine() {

			// get invocation arguments
			var args = _.toArray(arguments);

			// invoke
			var results = _.map(this.destinations, function (destination) {

				// invoke the fn with destination as first argument.
				var lineArgs = [destination].concat(args);
				return func.apply(this, lineArgs);

			}, this);

			// return promise, as always.
			return q.all(results);

		}, this);
	}



	/**
	 * [0] full matched str
	 * [1] method
	 * [2] arguments
	 *
	 * [stringLineFnParse description]
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	var lineMatcher = /^\s*([^:]*)(?::(.*))?$/,
		argsSplit   = /\s*,\s*/g;

	function stringLineFnParse(str) {

		var match = str.match(lineMatcher);

		if (!match) {
			throw new Error('Invalid line definition for jquery-pipe.');
		}

		return {
			method: match[1],
			args  : match[2] ? match[2].split(argsSplit) : []
		};
	}


	/**
	 *
	 * @param  {[type]} stringLineStr     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function stringLineFn(stringLineStr, lineName) {

		var parsed = stringLineFnParse(stringLineStr);

		// [1] check if there is a method on the destination
		//     corresponding to the line defined
		return _.bind(function pipeInvokeMethodsOnDestinations() {

			// get invocation arguments
			var args = parsed.args.concat(_.toArray(arguments));

			// invoke methods on destinations.
			var results = _.map(this.destinations, function (destination) {
				// invoke method on the destination
				return destination[parsed.method].apply(destination, args);
			});

			// return promise, as always.
			return q.all(results);

		}, this);
	}



	/**
	 * Given an line of any format,
	 * returns a function to be executed.
	 *
	 * @param  {[type]} line     [description]
	 * @param  {[type]} lineName [description]
	 * @return {[type]}            [description]
	 */
	function lineFn(line, lineName) {
		if (_.isString(line)) {
			// invoke destination method.
			return stringLineFn.call(this, line, lineName);

		} else if (_.isArray(line)) {
			// multiple lines
			return arrayLineFn.call(this, line, lineName);

		} else if (_.isFunction(line)) {
			return line;
		}
	}


	module.exports = lineFn;
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/line/index',['require','exports','module','../auxiliary','./fn'],function (require, exports, module) {
	

	var aux    = require('../auxiliary'),
		// the fn parser
		lineFn = require('./fn');


	/**
	 * [line description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.line = function pipeLine() {

		var name, definition;

		if (arguments.length === 1) {
			// arguments: [definition]
			name       = '*';
			definition = arguments[0];
		} else {
			// arguments: [name, definition, pull]
			name       = arguments[0];
			definition = arguments[1];
		}

		// save the line to the lines object hash
		this.lines[name] = {
			fn     : lineFn.call(this, definition, name),
			matcher: aux.wildcard(name),
		};


		return this;
	};
	// alias.
	exports.pipeline = exports.line;

	/**
	 * [rmLine description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.rmLine = function rmPipeLine(name) {
		delete this.lines[name];

		return this;
	};
});

//     pipe
//     (c) simonfan
//     pipe is licensed under the MIT terms.

/**
 * AMD and CJS module.
 *
 * @module pipe
 */

/* jshint ignore:start */

/* jshint ignore:end */

define('pipe',['require','exports','module','subject','lodash','./__pipe/mapping','./__pipe/stream-control','./__pipe/line/index'],function (require, exports, module) {
	

	var subject = require('subject'),
		_       = require('lodash');


	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} pipelines [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(pipelines, options) {

			options = options || {};

			this.source = {};
			if (options.source) {
				this.from(source);
			}

			if (options.destination) {
				this.to(options.destination);
			}

			// the cache. if set to false, no cache will be used.
			this.cache = options.cache === false ? false : {};

			// object on which pipelines will be stored.
			this.lines = {};
			// build pipelines
			_.each(pipelines, function (pipeline, name) {

				this.line(name, pipeline);

			}, this);
		},


		/**
		 * Checks if a property has uncached changes on the source
		 *
		 * @param  {[type]} prop [description]
		 * @return {[type]}      [description]
		 */
		changed: function changed(prop) {
			return this.source[prop] !== this.cache[prop];
		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/stream-control'))
		.assignProto(require('./__pipe/line/index'));
});

