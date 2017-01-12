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
	
	var _geo = __webpack_require__(5);
	
	var _geo2 = _interopRequireDefault(_geo);
	
	var _app = __webpack_require__(6);
	
	var _app2 = _interopRequireDefault(_app);
	
	var _message = __webpack_require__(9);
	
	var _message2 = _interopRequireDefault(_message);
	
	var _sendForm = __webpack_require__(11);
	
	var _sendForm2 = _interopRequireDefault(_sendForm);
	
	var _map = __webpack_require__(14);
	
	var _map2 = _interopRequireDefault(_map);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var PubNubService = function () {
	    PubNubService.$inject = ["$rootScope", "$q", "GeoService", "$http"];
	    function PubNubService($rootScope, $q, GeoService, $http) {
	        "ngInject";
	
	        _classCallCheck(this, PubNubService);
	
	        this._rootScope = $rootScope;
	        this._http = $http;
	        this._q = $q;
	        this._GeoService = GeoService;
	        this._channel = 'chatroom';
	        this.username = '';
	    }
	
	    _createClass(PubNubService, [{
	        key: 'init',
	        value: function init() {
	            var _this = this;
	
	            this._pubnub = new PubNub({
	                subscribeKey: "sub-c-e622b4f8-d7d4-11e6-baae-0619f8945a4f",
	                publishKey: "pub-c-f9081d4e-f107-4d19-85f7-b453dbc9b13e"
	            });
	            this._http.get('https://uinames.com/api/').then(function (res) {
	                _this.username = res.data.name + ' ' + res.data.surname;
	                _this._pubnub.addListener(_this._getListener());
	                _this._pubnub.subscribe({
	                    channels: [_this._channel],
	                    withPresence: true,
	                    uuid: _this.username
	                });
	                _this._GeoService.getLatLng().then(function (coords) {
	                    _this._pubnub.setState({
	                        channel: _this._channel,
	                        state: coords
	                    });
	                });
	            });
	        }
	    }, {
	        key: 'getHistory',
	        value: function getHistory() {
	            var _this2 = this;
	
	            return this._q(function (res, rej) {
	                _this2._pubnub.history({
	                    channel: _this2._channel
	                }, function (status, response) {
	                    console.log('history', status, response);
	                    if (status.statusCode !== 200) {
	                        rej(status);
	                    }
	                    res(response.messages);
	                });
	            });
	        }
	    }, {
	        key: 'getOnlineUsers',
	        value: function getOnlineUsers() {
	            var _this3 = this;
	
	            return this._q(function (res) {
	                _this3._pubnub.hereNow({
	                    includeUUIDs: true,
	                    includeState: true,
	                    channel: _this3._channel
	                }, function (status, response) {
	                    console.log('here now', status, response);
	                    res(response);
	                });
	            });
	        }
	    }, {
	        key: 'publish',
	        value: function publish(message) {
	            this._pubnub.publish({
	                message: message,
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
/* 5 */
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
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _app = __webpack_require__(7);
	
	var _app2 = _interopRequireDefault(_app);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    template: __webpack_require__(8),
	    controller: _app2.default
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var AppController = function () {
	    AppController.$inject = ["PubNubService", "$scope"];
	    function AppController(PubNubService, $scope) {
	        "ngInject";
	
	        _classCallCheck(this, AppController);
	
	        this._PubNub = PubNubService;
	        this._scope = $scope;
	
	        this.messages = [];
	    }
	
	    _createClass(AppController, [{
	        key: "$onInit",
	        value: function $onInit() {
	            var _this = this;
	
	            this._PubNub.getHistory().then(angular.bind(this, function (messages) {
	                this.messages = messages.map(function (el) {
	                    return el.entry;
	                }).reverse();
	
	                this._PubNub.getOnlineUsers().then(angular.bind(this, function (response) {}));
	            }));
	            this._scope.$on('message', function (e, m) {
	                _this._scope.$apply(function () {
	                    _this.messages.unshift(m);
	                });
	            });
	        }
	    }]);
	
	    return AppController;
	}();
	
	exports.default = AppController;

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = "<div class=\"row\">\n    <div class=\"col-xs-8\">\n        <send-form></send-form>\n        <hr/>\n        <message ng-repeat=\"message in $ctrl.messages track by $index\" message=\"message\"></message>\n    </div>\n    <div class=\"col-xs-4\">\n        <map user-coords=\"$ctrl.getUsersCoords()\" last-user-coord=\"$ctrl.getLastUserCoords()\"></map>\n    </div>\n</div>"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.default = {
	    bindings: {
	        message: '<'
	    },
	    template: __webpack_require__(10)
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = "<p class=\"bg-info\" ng-bind=\"$ctrl.message.text\"></p>"

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _sendForm = __webpack_require__(12);
	
	var _sendForm2 = _interopRequireDefault(_sendForm);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    template: __webpack_require__(13),
	    controller: _sendForm2.default
	};

/***/ },
/* 12 */
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
/* 13 */
/***/ function(module, exports) {

	module.exports = "<form ng-submit=\"$ctrl.submit($ctrl.text)\">\n    <textarea ng-model=\"$ctrl.text\" rows=\"3\" style=\"resize: none\"\n              class=\"form-control\"></textarea>\n    <button style=\"margin-top: 10px;\" class=\"btn btn-default\" type=\"submit\">Send</button>\n</form>"

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _map = __webpack_require__(15);
	
	var _map2 = _interopRequireDefault(_map);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	exports.default = {
	    bindings: {
	        userCoords: '<',
	        lastUserCoord: '<'
	    },
	    template: __webpack_require__(16),
	    controller: _map2.default
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var MapController = function () {
	    MapController.$inject = ["$element", "GeoService"];
	    function MapController($element, GeoService) {
	        "ngInject";
	
	        _classCallCheck(this, MapController);
	
	        this._GeoService = GeoService;
	        this._$element = $element;
	        this._markers = [];
	    }
	
	    _createClass(MapController, [{
	        key: "$onInit",
	        value: function $onInit() {
	            this._map = new google.maps.Map(this._$element[0].children[0], {
	                center: { lat: -34.397, lng: 150.644 },
	                zoom: 6
	            });
	        }
	    }]);
	
	    return MapController;
	}();
	
	exports.default = MapController;

/***/ },
/* 16 */
/***/ function(module, exports) {

	module.exports = "<div style=\"height: 300px;\"></div>"

/***/ }
]);
//# sourceMappingURL=app.bundle.js.map