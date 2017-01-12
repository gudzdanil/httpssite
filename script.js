(function () {
    angular.module('es360', [])
        .run(['PubNubService', function (PubNubService) {
            PubNubService.init();
        }])
        .service('PubNubService', PubNubService)
        .service('GeoService', GeoService)
        .component('app', {
            template: '<div class="row"><div class="col-xs-8"><send-form></send-form><hr/><message ng-repeat="message in $ctrl.messages track by $index" message="message"></message></div><div class="col-xs-4"><map user-coords="$ctrl.getUsersCoords()" last-user-coord="$ctrl.getLastUserCoords()"></map></div></div>',
            controller: AppController
        })
        .component('message', {
            bindings: {
                message: '<'
            },
            template: '<p class="bg-info" ng-bind="$ctrl.message.text"></p>'
        })
        .component('sendForm', {
            template: '<form ng-submit="$ctrl.submit($ctrl.text)"><textarea ng-model="$ctrl.text" rows="3" style="resize: none" class="form-control"></textarea><button style="margin-top: 10px;" class="btn btn-default" type="submit">Send</button></form>',
            controller: ['PubNubService', function (PubNubService) {
                this.text = '';
                this.submit = angular.bind(this, function () {
                    PubNubService.publish({text: this.text});
                    this.text = '';
                });
            }]
        })
        .component('map', {
            bindings: {
                userCoords: '<',
                lastUserCoord: '<'
            },
            template: '<div style="height: 300px;"></div>',
            controller: MapController
        });

    function MapController($element, GeoService) {
        this._GeoService = GeoService;
        this._$element = $element;
        this._markers = [];
    }
    MapController.$inject = ['$element', 'GeoService'];
    MapController.prototype.$onInit = function () {
        var map = this._map = new google.maps.Map(this._$element[0].children[0], {
            center: {lat: -34.397, lng: 150.644},
            zoom: 6
        });
    };




})();