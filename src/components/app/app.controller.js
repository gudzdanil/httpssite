class AppController {
    constructor(PubNubService, $scope) {
        "ngInject";
        this._PubNub = PubNubService;
        this._scope = $scope;

        this.messages = [];
        this.users = [];
    }

    $onInit() {
        this._PubNub.getHistory().then(messages => {
            this.messages = messages.map(function (el) {
                return el.entry;
            }).reverse();

            this._PubNub.getOnlineUsers().then(response => {
                this.users = [];
                for(let i in response.channels) {
                    if(response.channels.hasOwnProperty(i)) {
                        this.users.push(...response.channels[i].occupants);
                    }
                }
            });
        });
        this._scope.$on('message', (e, m) => {
            this._scope.$apply(() => {
                this.messages.unshift(m);
            });
        });
        this._scope.$on('user', (e, m) => {
            if(m.action === 'state-change') {
                if(!this.users.length) {
                    return;
                }
                this._scope.$apply(() => {
                    this.users.filter((u) => u.uuid === m.uuid)[0].state = m.state;
                    let arr = this.users;
                    this.users = [];
                    this.users.push(...arr);
                });
            }
        });
    }

    getUsersCoords() {
        return this.users;
    }

    getLastUserId() {
        return this.messages.length ? this.messages[0].user : null;
    }
}

export default AppController;