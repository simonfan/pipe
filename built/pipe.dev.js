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
		this.clearCache();

		destinations = _.isArray(destinations) ? destinations : [destinations];

		this.destinations = destinations;

		return this;
	};

	/**
	 * [addDestination description]
	 * @param {[type]} destinations [description]
	 */
	exports.addDestination = function pipeAddDestination(destinations) {
		this.clearCache();

		// convert added destinations to array.
		destinations = _.isArray(destinations) ? destinations : [destinations];

		if (!this.destinations) {
			// create a destinations object if none is set.
			this.destinations = [];
		}

		// add new destinations to old ones.
		this.destinations = this.destinations.concat(destinations);

		return this;

	};

	/**
	 * [removeDestination description]
	 * @param  {[type]} criteria [description]
	 * @param  {[type]} context  [description]
	 * @return {[type]}          [description]
	 */
	exports.removeDestination = function pipeRmDestination(criteria, context) {
		this.clearCache();

		_.remove(this.destinations, criteria, context);

		return this;
	};

	/**
	 * Defines the source.
	 *
	 * @param  {[type]} source [description]
	 * @return {[type]}        [description]
	 */
	exports.from = function pipeFrom(source) {
		// restart cache
		this.clearCache();

		this.source = source;

		return this;
	};

});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/pump',['require','exports','module','lodash','q'],function (require, exports, module) {
	


	var _ = require('lodash'),
		q = require('q');


	/**
	 * SINGLE DESTINATION
	 *
	 * @param  {[type]} value       [description]
	 * @param  {[type]} destination [description]
	 * @param  {[type]} properties  [description]
	 * @return {[type]}             [description]
	 */
	function pumpValueToDestination(value, destination, properties) {


		var res = _.map(properties, function (prop) {

			// [2.1.1.1] SET value onto DESTINATION
			return this._destSet(destination, prop, value);

		}, this);

		return q.all(res);
	}

	/**
	 * MULTIPLE DESTINATIONS
	 *
	 * @param  {[type]} value        [description]
	 * @param  {[type]} destinations [description]
	 * @param  {[type]} properties   [description]
	 * @return {[type]}              [description]
	 */
	function pumpValueToDestinations(value, destinations, properties) {

		var res = _.map(destinations, function (dest) {

			return pumpValueToDestination.call(this, value, dest, properties);

		}, this);

		return q.all(res);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the source object.
	 *
	 * [pumpPipe description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	module.exports = function pump(srcProp, destProps) {


		var destinations = this.destinations;

		// [1] GET value from SOURCE
		return q(this._srcGet(this.source, srcProp))
			// [2] promise then
			.then(_.bind(function (value) {

				// [2.1] check if cached value is the same as
				//       current value
				if (value !== this.cache.src[srcProp]) {

					// [2.2] set value to cache
					this.cache.src[srcProp] = value;

					// [3] resolve pumpDefer agter
					//     value has been pumped to destinations
					return pumpValueToDestinations.call(this, value, destinations, destProps)


				}// else return nothing, solve immediately

			}, this))
			.fail(function (e) { throw e; });
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/drain',['require','exports','module','lodash','q'],function (require, exports, module) {
	


	var _ = require('lodash'),
		q = require('q');

	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	module.exports = function drainPipeline(srcProp, destProps) {

		// [1] GET value from the first DESTINATION (destinations[0])
		return q(this._destGet(this.destinations[0], destProps[0]))
			.then(_.bind(function (value) {
				// [2] check cache
				if (value !== this.cache.dest[destProps]) {

					// [2.1] SET value onto SOURCE
					return this._srcSet(this.source, srcProp, value);
				} // else: return undefined (solve immediately)
			}, this))
			.fail(function (e) { throw e; });

	};

});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/index',['require','exports','module','lodash','q','./pump','./drain'],function (require, exports, module) {
	

	var _ = require('lodash'),
		q = require('q');

	/**
	 * runs action with lines.
	 *
	 * @param  {Function} fn    [description]
	 * @param  {[type]}   lines [description]
	 * @return {[type]}         [description]
	 */
	function streamPipeline(streamFn, lines) {

		// [1] create a deferred object.
		var defer = q.defer();

		// [2] pick the lines to be executed.
		//     defaults to ALL
		lines = lines ? _.pick(this.lines, lines) : this.lines;

		// [3] call the streamFn for all lines.
		var results = _.map(lines, function (destProps, srcProp) {

			// run the action
			return streamFn.call(this, srcProp, destProps);

		}, this);

		// [4] resolve the deferred object with NO VALUES
		//     when all the streamFn invocations have been completed.
		q.all(results).done(function () {
			// resolve with no arguments.
			defer.resolve();
		});

		// [5] return the promise.
		return defer.promise;
	}

	/**
	 * [exports description]
	 * @return {[type]} [description]
	 */
	exports.pump = _.partial(streamPipeline, require('./pump'));

	/**
	 * [drain description]
	 * @type {[type]}
	 */
	exports.drain = _.partial(streamPipeline, require('./drain'));

	/**
	 * Sets data onto source AND pumpes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data) {

		// [0] throw error if there is no source in the pipe object.
		if (!this.source) {
			throw new Error('No source for pipe');
		}

		// [1] SET all data onto the SOURCE
		var srcSetRes = _.map(data, function (value, key) {

			return this._srcSet(this.source, key, value);

		}, this);


		// [2] wait for all srcSets
		return q.all(srcSetRes).then(

			// [2.1] then invoke pump on success
			//       wrap in a method in order to guarantee
			//       pump is invoked with NO ARGUMENTS
			_.bind(function() { this.pump(); }, this),

			// [2.2] or throw error
			function (e) { throw e; }
		);
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/line',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	/**
	 * [line description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.line = function pipeLine() {

		var src, dest;

		if (_.isString(arguments[0])) {

			// arguments = [src, dest]
			src  = arguments[0];
			dest = arguments[1] || src;

			// dest must be an array
			dest = _.isArray(dest) ? dest : [dest];

			// set line.
			this.lines[src] = dest;

		} else if (_.isObject(arguments[0])) {
			// arguments = [{ src: dest }]

			_.each(arguments[0], function (dest, src) {
				this.line(src, dest);
			}, this);

		}

		return this;
	};

	/**
	 * [removeLine description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.removeLine = function rmPipeLine(name) {
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

define('pipe',['require','exports','module','subject','lodash','./__pipe/mapping','./__pipe/streams/index','./__pipe/line'],function (require, exports, module) {
	

	var subject = require('subject'),
		_       = require('lodash');


	var extensionOptionNames = ['srcGet', 'srcSet', 'destGet', 'destSet'];

	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} mappings [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(lines, options) {

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
			this.cache = options.cache === false ? false : {
				src: {},
				dest: {},
			};

			if (options.source) {
				this.from(options.source);
			}

			if (options.destination) {
				this.to(options.destination);
			}

			// object on which line mappings will be stored.
			this.lines = {};
			this.line(lines);
		},

		get: function pipeGet(object, property) {
			return object[property];
		},

		set: function pipeSet(object, property, value) {
			object[property] = value;

			return object;
		},

/*

	exports.srcGet
	exports.srcSet

	exports.destGet
	exports.destSet
*/


		clearCache: function clearCache() {
			this.cache = {
				src: {},
				dest: {},
			};

			return this;
		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/streams/index'))
		.assignProto(require('./__pipe/line'));
});

