class SendFormController {
    constructor(PubNubService) {
        "ngInject";

        this._PubNub = PubNubService;
        this.text = '';
    }

    submit() {
        this._PubNub.publish({text: this.text});
        this.text = '';
    }
}

export default SendFormController;