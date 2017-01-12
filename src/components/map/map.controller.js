import _ from 'lodash';

class MapController {
    constructor($element, GeoService, $scope) {
        "ngInject";

        this._GeoService = GeoService;
        this._$element = $element;
        this._markers = [];
        this._scope = $scope;
        this.last = null;
    }

    $onChanges(changesObj) {
        if (changesObj.userCoords) {
            this.clearMarkers();
            if (changesObj.userCoords.currentValue && changesObj.userCoords.currentValue.length) {
                this.initMarkers();
            }
        }
        if (changesObj.lastUserId) {
            this.resetMarkerIcons();
            if (changesObj.lastUserId.currentValue) {
                this._markers.filter(m => {
                    if (m.uuid === this.lastUserId) {
                        m.marker.setIcon(this.getIcon().url);
                    }
                });
            }
        }
    }

    resetMarkerIcons() {
        for (let i = 0; i < this._markers.length; i++) {
            this._markers[i].marker.setIcon(this.getDefaultIcon().url);
        }
    }

    getDefaultIcon() {
        return {
            scaledSize: new google.maps.Size(20, 25),
            size: new google.maps.Size(20, 25),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(10, 25),
            url: 'https://www.fuzu.com/assets/fa-map-marker-black-076c91ebe04439cf1dea1e3d41cdcf8a9e74d5dcc5682578cd6966ee977a0e75.png'
        };
    }

    getIcon() {
        return {
            scaledSize: new google.maps.Size(30, 25),
            size: new google.maps.Size(30, 25),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(15, 25),
            url: 'http://promujer.org/content/themes/storyware/resources/assets/build/svg/map-marker.svg'
        };
    }

    $onInit() {
        this._map = new google.maps.Map(this._$element[0].children[0], {
            center: {lat: 0, lng: 0},
            zoom: 1
        });
        // setTimeout(() => {
        //     let marker = new google.maps.Marker({
        //         position: {lat: 0, lng: 0},//_.cloneDeep(this.userCoords[i].state),
        //         map: this._map
        //     });
        // }, 2000);

    }

    clearMarkers() {
        for (let i = 0; i < this._markers; i++) {
            this._markers.marker.setMap(null);
        }
        this._markers = [];
    }

    initMarkers() {
        for (let i = 0; i < this.userCoords.length; i++) {
            let marker = new google.maps.Marker({
                position: _.cloneDeep(this.userCoords[i].state),
                map: this._map,
                icon: this.userCoords[i].uuid === this.lastUserId ? this.getIcon() : this.getDefaultIcon()
            });
            this._markers.push({
                marker: marker,
                uuid: this.userCoords[i].uuid
            });
        }
    }
}

export default MapController;