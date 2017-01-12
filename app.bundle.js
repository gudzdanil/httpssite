webpackJsonp([0],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _angular = __webpack_require__(1);
	
	var _angular2 = _interopRequireDefault(_angular);
	
	var _run = __webpack_require__(3);
	
	var _run2 = _interopRequireDefault(_run);
	
	var _pubNub = __webpack_require__(4);
	
	var _pubNub2 = _interopRequireDefault(_pubNub);
	
	var _geo = __webpack_require__(7);
	
	var _geo2 = _interopRequireDefault(_geo);
	
	var _app = __webpack_require__(8);
	
	var _app2 = _interopRequireDefault(_app);
	
	var _message = __webpack_require__(15);
	
	var _message2 = _interopRequireDefault(_message);
	
	var _sendForm = __webpack_require__(19);
	
	var _sendForm2 = _interopRequireDefault(_sendForm);
	
	var _map = __webpack_require__(24);
	
	var _map2 = _interopRequireDefault(_map);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(29);
	
	_angular2.default.module('es360', []).run(_run2.default).service('PubNubService', _pubNub2.default).service('GeoService', _geo2.default).component('app', _app2.default).component('message', _message2.default).component('sendForm', _sendForm2.default).component('map', _map2.default);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	run.$inject = ["PubNubService"];
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	function run(PubNubService) {
	    "ngInject";
	
	    PubNubService.init();
	}
	
	exports.default = run;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _lodash = __webpack_require__(5);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PubNubService = function () {
	    PubNubService.$inject = ["$rootScope", "$q", "GeoService", "$http", "$window"];
	    function PubNubService($rootScope, $q, GeoService, $http, $window) {
	        "ngInject";
	
	        var _this = this;
	
	        _classCallCheck(this, PubNubService);
	
	        this._rootScope = $rootScope;
	        this._http = $http;
	        this._q = $q;
	        this._GeoService = GeoService;
	        this._channel = 'chatroom3';
	        this.username = '';
	
	        var stored = $window.localStorage.getItem('username');
	        this._usernamePromise = stored ? $q.resolve(this.username = stored) : this._http.get('https://uinames.com/api/').then(function (res) {
	            _this.username = res.data.name + ' ' + res.data.surname;
	            $window.localStorage.setItem('username', _this.username);
	            return _this.username;
	        }, function () {
	            _this.username = 'Anonymous';
	            return $q.resolve(_this.username);
	        });
	
	        this._geoPromise = this._GeoService.getLatLng();
	    }
	
	    _createClass(PubNubService, [{
	        key: 'init',
	        value: function init() {
	            var _this2 = this;
	
	            this._q.all([this._usernamePromise, this._geoPromise]).then(function (responses) {
	                _this2._pubnub = new PubNub({
	                    subscribeKey: "sub-c-e622b4f8-d7d4-11e6-baae-0619f8945a4f",
	                    publishKey: "pub-c-f9081d4e-f107-4d19-85f7-b453dbc9b13e",
	                    uuid: responses[0]
	                });
	                _this2._pubnub.addListener(_this2._getListener());
	                _this2._pubnub.subscribe({
	                    channels: [_this2._channel],
	                    withPresence: true
	                });
	                _this2._pubnub.setState({
	                    channels: [_this2._channel],
	                    state: responses[1]
	                }, function (status, response) {
	                    console.log('set status res', arguments);
	                });
	            });
	        }
	    }, {
	        key: 'getHistory',
	        value: function getHistory() {
	            var _this3 = this;
	
	            return this._q.all([this._usernamePromise, this._geoPromise]).then(function (responses) {
	                return _this3._q(function (res, rej) {
	                    _this3._pubnub.history({
	                        channel: _this3._channel
	                    }, function (status, response) {
	                        console.log('history', status, response);
	                        if (status.statusCode !== 200) {
	                            rej(status);
	                        }
	                        res(response.messages);
	                    });
	                });
	            });
	        }
	    }, {
	        key: 'getOnlineUsers',
	        value: function getOnlineUsers() {
	            var _this4 = this;
	
	            return this._q.all([this._usernamePromise, this._geoPromise]).then(function (responses) {
	                return _this4._q(function (res) {
	                    _this4._pubnub.hereNow({
	                        includeUUIDs: true,
	                        includeState: true,
	                        channels: [_this4._channel]
	                    }, function (status, response) {
	                        console.log('here now', status, response);
	                        res(response);
	                    });
	                });
	            });
	        }
	    }, {
	        key: 'publish',
	        value: function publish(message) {
	            this._pubnub.publish({
	                message: _lodash2.default.assign({ user: this.username }, message),
	                channel: this._channel
	            }, function (status, response) {
	                // handle status, response
	                console.log('publish response', arguments);
	            });
	        }
	    }, {
	        key: '_getListener',
	        value: function _getListener() {
	            return this._listener || (this._listener = {
	                message: angular.bind(this, function (m) {
	                    console.log('message', m);
	                    this._rootScope.$broadcast('message', m.message);
	                }),
	                presence: angular.bind(this, function (p) {
	                    console.log('user', p);
	                    this._rootScope.$broadcast('user', p);
	                }),
	                status: angular.bind(this, function (s) {
	                    console.log('status', s);
	                    this._rootScope.$broadcast('status', s);
	                })
	            });
	        }
	    }]);
	
	    return PubNubService;
	}();
	
	exports.default = PubNubService;

/***/ },
/* 5 */,
/* 6 */,
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var GeoService = function () {
	    GeoService.$inject = ["$q"];
	    function GeoService($q) {
	        "ngInject";
	
	        _classCallCheck(this, GeoService);
	
	        this._q = $q;
	    }
	
	    _createClass(GeoService, [{
	        key: "getLatLng",
	        value: function getLatLng() {
	            return this._q(function (res, rej) {
	                if (navigator.geolocation) {
	                    navigator.geolocation.getCurrentPosition(function (position) {
	                        res({
	                            lat: position.coords.latitude,
	                            lng: position.coords.longitude
	                        });
	                    }, function () {
	                        rej();
	                    });
	                } else {
	                    rej(true);
	                }
	            });
	        }
	    }]);
	
	    return GeoService;
	}();
	
	exports.default = GeoService;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _app = __webpack_require__(9);
	
	var _app2 = _interopRequireDefault(_app);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(10);
	
	exports.default = {
	    template: __webpack_require__(14),
	    controller: _app2.default
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var AppController = function () {
	    AppController.$inject = ["PubNubService", "$scope"];
	    function AppController(PubNubService, $scope) {
	        "ngInject";
	
	        _classCallCheck(this, AppController);
	
	        this._PubNub = PubNubService;
	        this._scope = $scope;
	
	        this.messages = [];
	        this.users = [];
	    }
	
	    _createClass(AppController, [{
	        key: '$onInit',
	        value: function $onInit() {
	            var _this = this;
	
	            this._PubNub.getHistory().then(function (messages) {
	                _this.messages = messages.map(function (el) {
	                    return el.entry;
	                }).reverse();
	
	                _this._PubNub.getOnlineUsers().then(function (response) {
	                    _this.users = [];
	                    for (var i in response.channels) {
	                        if (response.channels.hasOwnProperty(i)) {
	                            var _users;
	
	                            (_users = _this.users).push.apply(_users, _toConsumableArray(response.channels[i].occupants));
	                        }
	                    }
	                });
	            });
	            this._scope.$on('message', function (e, m) {
	                _this._scope.$apply(function () {
	                    _this.messages.unshift(m);
	                });
	            });
	            this._scope.$on('user', function (e, m) {
	                if (m.action === 'state-change') {
	                    if (!_this.users.length) {
	                        return;
	                    }
	                    _this._scope.$apply(function () {
	                        var user = _this.users.filter(function (u) {
	                            return u.uuid === m.uuid;
	                        })[0];
	                        if (user) {
	                            user.state = m.state;
	                        } else {
	                            _this.users.push({
	                                uuid: m.uuid,
	                                state: m.state
	                            });
	                        }
	                        _this.users = [].concat(_toConsumableArray(_this.users));
	                    });
	                } else if (m.action === 'join') {
	                    var users = [].concat(_toConsumableArray(_this.users));
	                    if (!_this.users.filter(function (u) {
	                        return u.uuid === m.uuid;
	                    }).length) {
	                        users.unshift({ uuid: m.uuid, state: m.state });
	                    }
	                }
	            });
	        }
	    }, {
	        key: 'getUsersCoords',
	        value: function getUsersCoords() {
	            return this.users;
	        }
	    }, {
	        key: 'getLastUserId',
	        value: function getLastUserId() {
	            return this.messages.length ? this.messages[0].user : null;
	        }
	    }]);
	
	    return AppController;
	}();
	
	exports.default = AppController;

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(11);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./app.scss", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./app.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports
	
	
	// module
	exports.push([module.id, "app {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: block; }\n\n#message-list {\n  height: 63%;\n  width: 100%;\n  overflow-y: auto; }\n", ""]);
	
	// exports


/***/ },
/* 12 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = "<send-form></send-form>\n<div id=\"message-list\">\n    <message ng-repeat=\"message in $ctrl.messages track by $index\" message=\"message\"></message>\n</div>\n<map user-coords=\"$ctrl.getUsersCoords()\" last-user-id=\"$ctrl.getLastUserId()\"></map>\n"

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	__webpack_require__(16);
	
	exports.default = {
	    bindings: {
	        message: '<'
	    },
	    template: __webpack_require__(18)
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(17);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./message.scss", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./message.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports
	
	
	// module
	exports.push([module.id, "message {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  background: #ebf4ff;\n  padding: 10px;\n  border-top: 1px solid rgba(0, 0, 0, 0.4); }\n  message .message-username {\n    width: 150px;\n    border-right: 1px solid rgba(17, 85, 111, 0.3);\n    margin-right: 10px; }\n  message p {\n    margin-bottom: 0; }\n", ""]);
	
	// exports


/***/ },
/* 18 */
/***/ function(module, exports) {

	module.exports = "<div class=\"message-username\" ng-bind=\"$ctrl.message.user || 'Anonymous'\"></div><p ng-bind=\"$ctrl.message.text\"></p>"

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _sendForm = __webpack_require__(20);
	
	var _sendForm2 = _interopRequireDefault(_sendForm);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(21);
	
	exports.default = {
	    template: __webpack_require__(23),
	    controller: _sendForm2.default
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var SendFormController = function () {
	    SendFormController.$inject = ["PubNubService"];
	    function SendFormController(PubNubService) {
	        "ngInject";
	
	        _classCallCheck(this, SendFormController);
	
	        this._PubNub = PubNubService;
	        this.text = '';
	    }
	
	    _createClass(SendFormController, [{
	        key: 'submit',
	        value: function submit() {
	            this._PubNub.publish({ text: this.text });
	            this.text = '';
	        }
	    }]);
	
	    return SendFormController;
	}();
	
	exports.default = SendFormController;

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(22);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./send-form.scss", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./send-form.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports
	
	
	// module
	exports.push([module.id, "send-form {\n  height: 12%;\n  width: 100%;\n  display: block; }\n\ntextarea.form-control, button.btn {\n  height: 12vh; }\n", ""]);
	
	// exports


/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = "<form ng-submit=\"$ctrl.submit($ctrl.text)\" class=\"row\">\n    <div class=\"col-xs-8\">\n        <textarea ng-model=\"$ctrl.text\" style=\"resize: none\" placeholder=\"Input your message here\"\n                  class=\"form-control\"></textarea>\n    </div>\n    <div class=\"col-xs-4\">\n        <button class=\"btn btn-default btn-block\" type=\"submit\">Send</button>\n    </div>\n</form>"

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _map = __webpack_require__(25);
	
	var _map2 = _interopRequireDefault(_map);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	__webpack_require__(26);
	exports.default = {
	    bindings: {
	        userCoords: '<',
	        lastUserId: '<'
	    },
	    template: __webpack_require__(28),
	    controller: _map2.default
	};

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _lodash = __webpack_require__(5);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MapController = function () {
	    MapController.$inject = ["$element", "GeoService", "$scope"];
	    function MapController($element, GeoService, $scope) {
	        "ngInject";
	
	        _classCallCheck(this, MapController);
	
	        this._GeoService = GeoService;
	        this._$element = $element;
	        this._markers = [];
	        this._scope = $scope;
	        this.last = null;
	    }
	
	    _createClass(MapController, [{
	        key: '$onChanges',
	        value: function $onChanges(changesObj) {
	            var _this = this;
	
	            if (changesObj.userCoords) {
	                this.clearMarkers();
	                if (changesObj.userCoords.currentValue && changesObj.userCoords.currentValue.length) {
	                    this.initMarkers();
	                }
	            }
	            if (changesObj.lastUserId) {
	                this.resetMarkerIcons();
	                if (changesObj.lastUserId.currentValue) {
	                    this._markers.filter(function (m) {
	                        if (m.uuid === _this.lastUserId) {
	                            m.marker.setIcon(_this.getIcon().url);
	                        }
	                    });
	                }
	            }
	        }
	    }, {
	        key: 'resetMarkerIcons',
	        value: function resetMarkerIcons() {
	            for (var i = 0; i < this._markers.length; i++) {
	                this._markers[i].marker.setIcon(this.getDefaultIcon().url);
	            }
	        }
	    }, {
	        key: 'getDefaultIcon',
	        value: function getDefaultIcon() {
	            return {
	                scaledSize: new google.maps.Size(20, 25),
	                size: new google.maps.Size(20, 25),
	                origin: new google.maps.Point(0, 0),
	                anchor: new google.maps.Point(10, 25),
	                url: 'https://www.fuzu.com/assets/fa-map-marker-black-076c91ebe04439cf1dea1e3d41cdcf8a9e74d5dcc5682578cd6966ee977a0e75.png'
	            };
	        }
	    }, {
	        key: 'getIcon',
	        value: function getIcon() {
	            return {
	                scaledSize: new google.maps.Size(30, 25),
	                size: new google.maps.Size(30, 25),
	                origin: new google.maps.Point(0, 0),
	                anchor: new google.maps.Point(15, 25),
	                url: 'http://promujer.org/content/themes/storyware/resources/assets/build/svg/map-marker.svg'
	            };
	        }
	    }, {
	        key: '$onInit',
	        value: function $onInit() {
	            this._map = new google.maps.Map(this._$element[0].children[0], {
	                center: { lat: 0, lng: 0 },
	                zoom: 1
	            });
	            // setTimeout(() => {
	            //     let marker = new google.maps.Marker({
	            //         position: {lat: 0, lng: 0},//_.cloneDeep(this.userCoords[i].state),
	            //         map: this._map
	            //     });
	            // }, 2000);
	        }
	    }, {
	        key: 'clearMarkers',
	        value: function clearMarkers() {
	            for (var i = 0; i < this._markers; i++) {
	                this._markers.marker.setMap(null);
	            }
	            this._markers = [];
	        }
	    }, {
	        key: 'initMarkers',
	        value: function initMarkers() {
	            for (var i = 0; i < this.userCoords.length; i++) {
	                var marker = new google.maps.Marker({
	                    position: _lodash2.default.cloneDeep(this.userCoords[i].state),
	                    map: this._map,
	                    icon: this.userCoords[i].uuid === this.lastUserId ? this.getIcon() : this.getDefaultIcon()
	                });
	                this._markers.push({
	                    marker: marker,
	                    uuid: this.userCoords[i].uuid
	                });
	            }
	        }
	    }]);
	
	    return MapController;
	}();
	
	exports.default = MapController;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(27);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./map.scss", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./../../../node_modules/postcss-loader/index.js!./../../../node_modules/sass-loader/index.js!./map.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports
	
	
	// module
	exports.push([module.id, "map {\n  position: absolute;\n  bottom: 0;\n  height: 25%;\n  width: 100%;\n  display: block; }\n\nmap > div {\n  height: 100%; }\n", ""]);
	
	// exports


/***/ },
/* 28 */
/***/ function(module, exports) {

	module.exports = "<div></div>"

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(30);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./main.scss", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/postcss-loader/index.js!./../node_modules/sass-loader/index.js!./main.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports
	
	
	// module
	exports.push([module.id, "html, body {\n  height: 100%; }\n", ""]);
	
	// exports


/***/ }
]);
//# sourceMappingURL=app.bundle.js.map