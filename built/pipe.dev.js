/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/pump',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');


	exports.pump = function pump(properties, options) {
		// [1] keep properties in cache.
		var map  = this.maps.to,
			src  = this.src,
			dest = this.dest;

		// [2] pick the properties to be executed.
		//     defaults to ALL
		properties = properties ? _.pick(map, properties) : map;

		var force = (options && options.force);

		// [3]
		_.each(properties, function (destProps, srcProp) {

			// [3.1] GET value from SOURCE
			var value = this.srcGet(src, srcProp);

			// [3.2.2] pump values.
			_.each(destProps, function (destProp) {


				// [3.2] SET value
				// [3.2.1] check if cached value is the same as current value
				//         in cache checks always use the src prop.
				if (force || !this.cacheCheck(srcProp, value)) {


					this.destSet(dest, destProp, value);

					// this.cacheSet('dest', destProp, value);
				}

			}, this);


		}, this);

	};
});

/* jshint ignore:start */

/* jshint ignore:end */

define('__pipe/drain',['require','exports','module','lodash'],function (require, exports, module) {
	

	var _ = require('lodash');

	exports.drain = function drain() {

		var first  = arguments[0],
			second = arguments[1];

		var properties,
			options;


		// [1] get the map.
		var map  = this.maps.from;

		// [2] parse arguments
		if (_.isArray(first)) {
			// arguments: [properties, options]
			properties = _.pick(map, first);
			options    = second;

		} else if (_.isString(first)) {
			// arguments: [property, options]
			properties = {};
			properties[first] = map[first];
			options    = second;

		} else {
			// arguments: [options]
			properties = map;
			options    = first;

		}

		// default options
		options = options || {};

		var force = options.force;

		// source and destination in cache.
		var src  = this.src,
			dest = this.dest;

		// [3]
		_.each(properties, function (destProps, srcProp) {

			// [1] GET value from the first DESTINATION (dests[0])
			var value = this.destGet(this.dest, destProps[0]);

			// [2] check cache
			if (force || !this.cacheCheck(srcProp, value)) {
				// [2.1] SET value onto SOURCE
				this.srcSet(this.src, srcProp, value);

				// // [2.2] SET value onto source cache
				// this.cacheSet('src', srcProp, value);
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
	exports.inject = function inject(data, options) {

		// [0] throw error if there is no src in the pipe object.
		if (!this.src) {
			throw new Error('No src for pipe');
		}

		// [1] SET all data onto the SOURCE
		_.each(data, function (value, key) {

			if (!this.cacheCheck(key, value) || (options && options.force)) {
				this.srcSet(this.src, key, value);
			}

		}, this);

		// [2] pump data (no specific pipelines, options = true)
		this.pump(null, { force: true });
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
	


	// exports.clearCache = function clearCache() {
	// 	this.cache = {};

	// 	return this;
	// };


	exports.cacheClear = function cacheClear() {
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
	exports.cacheCheck = function cacheCheck(property, value) {
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



	// exports.cacheGet = function cacheGet(namespace, property) {
	// 	return this.cache[namespace][property];
	// };

	// exports.cacheSet = function cacheSet(namespace, property, value) {

	// 	this.cache[namespace][property] = value;

	// 	return this;
	// };

	// exports.cacheCheck = function cacheCheck(namespace, property, value) {

	// 	if (this.cache === false) {
	// 		// no cache.
	// 		// always return false on checks.
	// 		return false;
	// 	}

	// 	return this.cacheGet(namespace, property) === value;

	// };

	// exports.cacheClear = function cacheClear(namespace, properties) {
	// 	if (arguments.length === 0) {
	// 		// full clear.
	// 		this.cache = {
	// 			src: {},
	// 			dest: {}
	// 		};

	// 	} else if (arguments.length === 1) {
	// 		// arguments: [namespace]
	// 		this.cache[namespace] === {};

	// 	} else {
	// 		// arguments: [namespace, propertyOrProperties]

	// 		// properties must be array
	// 		properties = _.isArray(properties) ? properties : [properties];

	// 		// direct reference to the cache obj
	// 		var cache = this.cache[namespace];

	// 		_.each(properties, function (property) {
	// 			delete cache[property]
	// 		}, this);
	// 	}

	// 	return this;
	// };

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

	var pipe = module.exports = subject({


		/**
		 * [initialize description]
		 * @param  {[type]} map [description]
		 * @param  {[type]} options   [description]
		 * @return {[type]}           [description]
		 */
		initialize: function initialize(src, dest, map, options) {

			options = options || {};

			// getters and setters
			this.srcGet  = this.srcGet  || this.get;
			this.srcSet  = this.srcSet  || this.set;
			this.destGet = this.destGet || this.get;
			this.destSet = this.destSet || this.set;

			// the cache. if set to false, no cache will be used.
			if (options.cache !== false) {
				this.cacheClear();
			}

			// object on which map will be stored.
			this.maps = {
				from: {},
				to  : {}
			};

			if (src) { this.from(src); }
			if (dest) { this.to(dest); }
			if (map) { this.map(map, options.direction); }
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
			this.cacheClear();
			// set
			this.src = src;
			return this;
		},

		to: function pipeTo(dest) {
			this.cacheClear();
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

