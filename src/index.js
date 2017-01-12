require('./main.scss');

import angular from 'angular';

import run from './run';
import PubNubService from './services/pub-nub.service';
import GeoService from './services/geo.service';

import appComponent from './components/app/app.component';
import messageComponent from './components/message/message.component';
import sendFormComponent from './components/send-form/send-form.component';
import mapComponent from './components/map/map.component';

angular.module('es360', [])
    .run(run)
    .service('PubNubService', PubNubService)
    .service('GeoService', GeoService)
    .component('app', appComponent)
    .component('message', messageComponent)
    .component('sendForm', sendFormComponent)
    .component('map', mapComponent);