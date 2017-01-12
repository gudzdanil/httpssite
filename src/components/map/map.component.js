import controller from './map.controller';

export default {
    bindings: {
        userCoords: '<',
        lastUserCoord: '<'
    },
    template: require('./map.html'),
    controller: controller
};