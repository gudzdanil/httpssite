import _ from 'lodash';

class PubNubService {
    constructor($rootScope, $q, GeoService, $http, $window) {
        "ngInject";

        this._rootScope = $rootScope;
        this._http = $http;
        this._q = $q;
        this._GeoService = GeoService;
        this._channel = 'chatroom3';
        this.username = '';

        let stored = $window.localStorage.getItem('username');
        this._usernamePromise = stored ? $q.resolve(this.username = stored) : this._http.get('https://uinames.com/api/').then((res) => {
            this.username = res.data.name + ' ' + res.data.surname;
            $window.localStorage.setItem('username', this.username);
            return this.username;
        }, () => {
            this.username = 'Anonymous';
            return $q.resolve(this.username);
        });

        this._geoPromise = this._GeoService.getLatLng();
    }

    init() {
        this._q.all([this._usernamePromise, this._geoPromise]).then((responses) => {
            this._pubnub = new PubNub({
                subscribeKey: "sub-c-e622b4f8-d7d4-11e6-baae-0619f8945a4f",
                publishKey: "pub-c-f9081d4e-f107-4d19-85f7-b453dbc9b13e",
                uuid: responses[0]
            });
            this._pubnub.addListener(this._getListener());
            this._pubnub.subscribe({
                channels: [this._channel],
                withPresence: true
            });
            this._pubnub.setState({
                channels: [this._channel],
                state: responses[1]
            }, function (status, response) {
                console.log('set status res', arguments);
            });
        });
    }

    getHistory() {
        return this._q.all([this._usernamePromise, this._geoPromise]).then(responses => {
            return this._q((res, rej) => {
                this._pubnub.history(
                    {
                        channel: this._channel
                    },
                    function (status, response) {
                        console.log('history', status, response);
                        if (status.statusCode !== 200) {
                            rej(status);
                        }
                        res(response.messages);
                    }
                );
            });
        });
    }

    getOnlineUsers() {
        return this._q.all([this._usernamePromise, this._geoPromise]).then(responses => {
            return this._q((res) => {
                this._pubnub.hereNow(
                    {
                        includeUUIDs: true,
                        includeState: true,
                        channels: [this._channel]
                    },
                    function (status, response) {
                        console.log('here now', status, response);
                        res(response);
                    }
                );
            });
        });
    }

    publish(message) {
        this._pubnub.publish(
            {
                message: _.assign({user: this.username}, message),
                channel: this._channel
            },
            function (status, response) {
                // handle status, response
                console.log('publish response', arguments);
            }
        );
    }

    _getListener() {
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
}

export default PubNubService;