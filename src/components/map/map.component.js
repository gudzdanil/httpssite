require('./map.scss');
import controller from './map.controller';

export default {
    bindings: {
        userCoords: '<',
        lastUserId: '<'
    },
    template: require('./map.html'),
    controller: controller
};