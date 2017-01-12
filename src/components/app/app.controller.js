class AppController {
    constructor(PubNubService, $scope) {
        "ngInject";
        this._PubNub = PubNubService;
        this._scope = $scope;

        this.messages = [];
    }

    $onInit() {
        this._PubNub.getHistory().then(angular.bind(this, function (messages) {
            this.messages = messages.map(function (el) {
                return el.entry;
            }).reverse();

            this._PubNub.getOnlineUsers().then(angular.bind(this, function (response) {

            }));
        }));
        this._scope.$on('message', (e, m) => {
            this._scope.$apply(() => {
                this.messages.unshift(m);
            });
        });
    }
}

export default AppController;