class GeoService {
    constructor($q) {
        "ngInject";
        this._q = $q;
    }

    getLatLng() {
        return this._q((res, rej) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    res({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                }, function () {
                    rej();
                });
            } else {
                rej(true);
            }
        });
    }
}

export default GeoService;