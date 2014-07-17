/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/pump',['require','exports','module','lodash'],function (require, exports, module) {
	


	var _ = require('lodash');


	/**
	 * SINGLE DESTINATION
	 *
	 * @param  {[type]} value       [description]
	 * @param  {[type]} dest [description]
	 * @param  {[type]} properties  [description]
	 * @return {[type]}             [description]
	 */
	function pumpValue(value, dest, properties) {


		_.each(properties, function (prop) {

			// [2.1.1.1] SET value onto DESTINATION
			return this._destSet(dest, prop, value);

		}, this);
	}

	/**
	 * Runs a single line
	 * testing its matcher across all properties of the src object.
	 *
	 * [pumpPipe description]
	 * @param  {[type]} def [description]
	 * @return {Promise}     [description]
	 */
	module.exports = function pumpPipeline(srcProp, destProps, force) {


		var dest = this.dest;


		// [1] GET value from SOURCE
		var value = this._srcGet(this.src, srcProp);

		// [2] SET value
		// [2.1] check if cached value is the same as current value
		if (!this.isCached(srcProp, value) || force) {

			// [2.2] pump values.
			pumpValue.call(this, value, dest, destProps);
		}
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/drain',['require','exports','module','lodash'],function (require, exports, module) {
	


	var _ = require('lodash');

	/**
	 * [drainPipeline description]
	 * @param  {[type]} srcProp   [description]
	 * @param  {[type]} destProps [description]
	 * @return {[type]}           [description]
	 */
	module.exports = function drainPipeline(srcProp, destProps, force) {

		// [1] GET value from the first DESTINATION (dests[0])
		var value = this._destGet(this.dest, destProps[0]);

		// [2] check cache
		if (!this.isCached(srcProp, value) || force) {
			// [2.1] SET value onto SOURCE
			this._srcSet(this.src, srcProp, value);
		}

		return this;
	};

});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/streams/index',['require','exports','module','lodash','./pump','./drain'],function (require, exports, module) {
	

	var _ = require('lodash');

	/**
	 * runs action with lines.
	 *
	 * @param  {Function} fn    [description]
	 * @param  {[type]}   lines [description]
	 * @return {[type]}         [description]
	 */
	function streamPipeline(streamFn, properties, force) {

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(this._map, properties) : this._map;

		// [3] call the streamFn for all lines.
		_.each(properties, function (destProps, srcProp) {

			// run the action
			streamFn.call(this, srcProp, destProps, force);

		}, this);

		// [4] return this.
		return this;
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
	 * Sets data onto src AND pumpes.
	 *
	 * @param  {[type]} data [description]
	 * @return {[type]}      [description]
	 */
	exports.inject = function inject(data, force) {

		// [0] throw error if there is no src in the pipe object.
		if (!this.src) {
			throw new Error('No src for pipe');
		}

		// [1] SET all data onto the SOURCE
		_.each(data, function (value, key) {

			if (!this.isCached(key, value) || force) {
				this._srcSet(this.src, key, value);
			}

		}, this);

		// [2] pump data (no specific pipelines, force = true)
		this.pump(null, true);
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

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/cache',['require','exports','module'],function (require, exports, module) {
	


	exports.clearCache = function clearCache() {
		this.cache = {};

		return this;
	};

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
	exports.isCached = function isCached(property, value) {
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

define('pipe',['require','exports','module','subject','lodash','./__pipe/streams/index','./__pipe/mapping','./__pipe/cache'],function (require, exports, module) {
	

	var subject = require('subject'),
		_       = require('lodash');


	var extensionOptionNames = ['get', 'set', 'srcGet', 'srcSet', 'destGet', 'destSet'];

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

			if (options.from) {
				this.from(options.from);
			}

			if (options.to) {
				this.to(options.to);
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

		from: function pipeFrom(src) {
			// restart cache
			this.clearCache();
			// set
			this.src = src;
			return this;
		},

		to: function pipeTo(dest) {
			this.clearCache();
			// set
			this.dest = dest;
			return this;
		},
	});

	// prototype
	pipe.assignProto(require('./__pipe/streams/index'))
		.assignProto(require('./__pipe/mapping'))
		.assignProto(require('./__pipe/cache'));
});

