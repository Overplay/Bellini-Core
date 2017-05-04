/**
 * Created by ryanhartzell on 5/1/17.
 */

app.factory( "geocode", function (sailsApi, uiGmapGoogleMapApi, $q) {

    var locate = function () {

        return $q( function (resolve, reject) {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (loc) {
                    resolve({
                        longitude: loc.coords.longitude.toString(),
                        latitude: loc.coords.latitude.toString()
                    })
                });
            }
            else {
                resolve({
                    longitude: 37.2805413,
                    latitude: -121.973019
                })
            }
        })

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
        revGeocode: revGeocode,
        locate: locate
    }
})