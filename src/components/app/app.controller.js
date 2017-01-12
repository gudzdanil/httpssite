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
                    let user  = this.users.filter((u) => u.uuid === m.uuid)[0];
                    if(user) {user.state = m.state;}
                    else {
                        this.users.push({
                            uuid: m.uuid,
                            state: m.state
                        });
                    }
                    this.users = [...this.users];
                });
            }
            else if(m.action === 'join') {
                let users = [...this.users];
                if(!(this.users.filter((u) => u.uuid === m.uuid).length)) {
                    users.unshift({uuid: m.uuid, state: m.state});
                }
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