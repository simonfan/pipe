/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/pump',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');


	exports.pump = function pump(properties, force) {
		// [1] keep properties in cache.
		var map  = this.maps.to,
			src  = this.src,
			dest = this.dest;

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(map, properties) : map;

		// [3]
		_.each(properties, function (destProps, srcProp) {

			// [3.1] GET value from SOURCE
			var value = this._srcGet(src, srcProp);

			// [3.2] SET value
			// [3.2.1] check if cached value is the same as current value
			if (!this.isCached(srcProp, value) || force) {

				// [3.2.2] pump values.
				_.each(destProps, function (prop) {

					return this._destSet(dest, prop, value);

				}, this);
			}


		}, this);

	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/drain',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	exports.drain = function drain(properties, force) {

		// [1] keep properties in cache.
		var map  = this.maps.from,
			src  = this.src,
			dest = this.dest;

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(map, properties) : map;

		// [3]
		_.each(properties, function (destProps, srcProp) {


			// [1] GET value from the first DESTINATION (dests[0])
			var value = this._destGet(this.dest, destProps[0]);

			// [2] check cache
			if (!this.isCached(srcProp, value) || force) {
				// [2.1] SET value onto SOURCE
				this._srcSet(this.src, srcProp, value);
			}

		}, this);


		// return this
		return this;
	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/inject',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

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

define('__pipe/map',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');


	/**
	 * Maps a single.
	 *
	 * @param  {[type]} src  [description]
	 * @param  {[type]} dest [description]
	 * @param  {[type]} type [description]
	 * @return {[type]}      [description]
	 */
	exports.mapSingle = function mapSingleAttribute(src, dest, direction) {

		// force dest into array format
		dest = _.isArray(dest) ? dest : [dest];

		if (direction && direction !== 'both') {

			// specific map
			this.maps[direction][src] = dest;

		} else {

			// set map on both
			this.maps.to[src]    = dest;
			this.maps.from[src]  = dest;
		}
	};


	/**
	 * [map description]
	 * @param  {[type]} name       [description]
	 * @param  {[type]} definition [description]
	 * @return {[type]}            [description]
	 */
	exports.map = function mapAttribute() {

		if (_.isString(arguments[0])) {

			// map
			this.mapSingle.apply(this, arguments);

		} else if (_.isObject(arguments[0])) {
			// arguments = [{
			// 		src: {
			// 			dest: 'destAttribute',
			// 			direction: 'dual' || 'drain' || 'pump'
			// 		},
			// 		src: 'destAttribute'  (direction = 'dual')
			// }]

			var direction = arguments[1];

			_.each(arguments[0], function (destDef, src) {

				var dest;

				if (_.isString(destDef)) {
					dest      = destDef;
				} else {
					dest      = destDef.dest;
					direction = destDef.direction || direction;
				}

				// invoke map method.
				this.mapSingle(src, dest, direction);

			}, this);

		}

		return this;
	};

	/**
	 * [unmap description]
	 * @param  {[type]} name [description]
	 * @return {[type]}      [description]
	 */
	exports.unmap = function unmapAttribute(name) {
		_.each(this.maps, function (map) {
			delete map[name];
		});

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

define('pipe',['require','exports','module','subject','lodash','./__pipe/pump','./__pipe/drain','./__pipe/inject','./__pipe/map','./__pipe/cache'],function (require, exports, module) {
	

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




			// object on which mappings will be stored.
			this.maps = {
				from: {},
				to  : {}
			};

			if (options.from) {
				this.from(options.from);
			}

			if (options.to) {
				this.to(options.to);
			}
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
	pipe.assignProto(require('./__pipe/pump'))
		.assignProto(require('./__pipe/drain'))
		.assignProto(require('./__pipe/inject'))
		.assignProto(require('./__pipe/map'))
		.assignProto(require('./__pipe/cache'));
});

