/**
 * Created by ryanhartzell on 5/1/17.
 */

app.factory( "geocode", function (sailsApi, uiGmapGoogleMapApi, $q) {

    var geocodePromise = function (address) {
        return uiGmapGoogleMapApi.then( function (maps) {
            return new maps.Geocoder();
        })
            .then( function (geocoder) {
                return $q(function (resolve, reject) {
                    geocoder.geocode( {
                        address: address
                    }, resolve);
                })
            })
    }

    var geocode = function (address) {

        return geocodePromise(address)
            .then( function (res, stat) {
                var latLong = {};

                if (res.length) {
                    latLong.latitude = res[0].geometry.location.lat();
                    latLong.longitude = res[0].geometry.location.lng();
                }

                return latLong;
            })
    };

    var locate = function () {

        return $q( function (resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition( resolve );
            }
            else {
                resolve()
            }
        })
            .then( function (loc) {
                return {
                    longitude: loc.coords.longitude.toString() || 37.2805413,
                    latitude: loc.coords.latitude.toString() || -121.973019
                }
            });

    };

    var revGeocode = function (latLong) {

        return sailsApi.apiGet('venue/yelpSearch', { params: {
            latitude: latLong.latitude,
            longitude: latLong.longitude,
            limit: 1
        }})
            .then( function (res) {
                return res.businesses[0].location;
            })
    }

    return {
        geocode: geocode,
        revGeocode: revGeocode,
        locate: locate
    }
})