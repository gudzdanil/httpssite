class MapController {
    constructor($element, GeoService) {
        "ngInject";

        this._GeoService = GeoService;
        this._$element = $element;
        this._markers = [];
    }

    $onInit () {
        this._map = new google.maps.Map(this._$element[0].children[0], {
            center: {lat: -34.397, lng: 150.644},
            zoom: 6
        });
    }
}

export default MapController;