/**
 * Created by ryanhartzell on 5/1/17.
 */

app.factory( "geocode", function (sailsApi, uiGmapGoogleMapApi, $q) {

    var geocoder;
    var maps;

    uiGmapGoogleMapApi.then( function (m) {
        maps = m;
        geocoder = new maps.Geocoder();
    });

    var geocode = function (address) {
        var chain = $q.when();

        this.geocoder.geocode( {
            address: address
        }, function (res, stat) {
            chain.then( function () {
                var latLong = {};

                if (res.length) {
                    latLong.latitude = res[0].geometry.location.lat();
                    latLong.longitude = res[0].geometry.location.lng();
                }

                return latLong;
            })
        });

        return chain;

    };

    var locate = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition( function (position) {
                return {
                    longitude: position.coords.longitude.toString(),
                    latitude: position.coords.latitude.toString()
                }
            })
        }
        else {
            return { latitude: 37.2805413, longitude: -121.973019 };
        }
    };

    var revGeocode = function (latLong) {

    }

    return {
        geocode: geocode,
        //revGeocode: revGeocode,
        locate: locate
    }
})