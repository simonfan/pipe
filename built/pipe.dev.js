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
	function pumpValue(value, destination, properties) {


		var res = _.map(properties, function (prop) {

			// [2.1.1.1] SET value onto DESTINATION
			return this._destSet(destination, prop, value);

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
	module.exports = function pumpPipeline(srcProp, destProps, force) {


		var destination = this.destination;

		// [1] GET value from SOURCE
		return q(this._srcGet(this.source, srcProp))
			// [2] promise then
			.then(_.bind(function (value) {

				// [2.1] check if cached value is the same as
				//       current value
				if (!this.isCached(srcProp, value) || force) {

					// [3] resolve pumpDefer agter
					//     value has been pumped to destination
					return pumpValue.call(this, value, destination, destProps)

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
	module.exports = function drainPipeline(srcProp, destProps, force) {

		// [1] GET value from the first DESTINATION (destinations[0])
		return q(this._destGet(this.destination, destProps[0]))
			.then(_.bind(function (value) {
				// [2] check cache
				if (!this.isCached(srcProp, value) || force) {

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
	function streamPipeline(streamFn, properties, force) {

		// [1] create a deferred object.
		var defer = q.defer();

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(this._map, properties) : this._map;

		// [3] call the streamFn for all lines.
		var results = _.map(properties, function (destProps, srcProp) {

			// run the action
			return streamFn.call(this, srcProp, destProps, force);

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
	exports.inject = function inject(data, force) {

		// [0] throw error if there is no source in the pipe object.
		if (!this.source) {
			throw new Error('No source for pipe');
		}

		// [1] SET all data onto the SOURCE
		var srcSetRes = _.map(data, function (value, key) {

			if (!this.isCached(key, value) || force) {
				return this._srcSet(this.source, key, value);
			}

		}, this);


		// [2] wait for all srcSets
		return q.all(srcSetRes).then(

			// [2.1] then invoke pump on success
			//       wrap in a method in order to guarantee
			//       pump is invoked with NO ARGUMENTS
			_.bind(function() { this.pump(void(0), true); }, this),

			// [2.2] or throw error
			function (e) { throw e; }
		);
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/mapping',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	/**
	 * [map description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.map = function mapAttribute() {

		var src, dest;

		if (_.isString(arguments[0])) {

			// arguments = [src, dest]
			src  = arguments[0];
			dest = arguments[1] || src;

			// dest must be an array
			dest = _.isArray(dest) ? dest : [dest];

			// set map.
			this._map[src] = dest;

		} else if (_.isObject(arguments[0])) {
			// arguments = [{ src: dest }]

			_.each(arguments[0], function (dest, src) {
				this.map(src, dest);
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
		delete this._map[name];

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

define('pipe',['require','exports','module','subject','lodash','./__pipe/streams/index','./__pipe/mapping'],function (require, exports, module) {
	

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
		initialize: function initialize(mappings, options) {

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
			if (options.cache !== false) {
				this.clearCache();
			}

			if (options.source) {
				this.from(options.source);
			}

			if (options.destination) {
				this.to(options.destination);
			}

			// object on which mappings will be stored.
			this._map = {};
			this.map(mappings);
		},

		get: function pipeGet(object, property) {
			return object[property];
		},

		set: function pipeSet(object, property, value) {
			object[property] = value;

			return object;
		},

	/*

		srcGet:
		srcSet

		destGet:
		destSet:
	*/


		clearCache: function clearCache() {
			this.cache = {};

			return this;
		},

		/**
		 * Does two things:
		 * [1] checks if the value is the same that is in cache
		 * (and return at end of execution)
		 * [2] if different, sets the value
		 *
		 * @param  {[type]} property [description]
		 * @param  {[type]} value    [description]
		 * @return {[type]}          [description]
		 */
		isCached: function isCached(property, value) {
			if (!this.cache) {

				// no cache, always return false
				return false;

			} else {

				if (this.cache[property] !== value) {

					// set cache value
					this.cache[property] = value;

					// value not in cache
					return false;
				} else {
					// values are equal
					// value in cache
					return true;
				}
			}

		},

		/**
		 * Defines destination
		 *
		 * @param  {[type]} destination [description]
		 * @return {[type]}             [description]
		 */
		to: function pipeTo(destination) {
			this.clearCache();

			this.destination = destination;

			return this;
		},



		/**
		 * Defines the source.
		 *
		 * @param  {[type]} source [description]
		 * @return {[type]}        [description]
		 */
		from: function pipeFrom(source) {
			// restart cache
			this.clearCache();

			this.source = source;

			return this;
		},

	});

	// prototype
	pipe.assignProto(require('./__pipe/streams/index'))
		.assignProto(require('./__pipe/mapping'));
});

