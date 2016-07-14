/**
 * Created by rhartzell on 5/24/16.
 */

addressify = function (address) {
    return address.street + ' '
    + address.city + ', '
    + address.state + ' '
    + address.zip
};

app.controller("addEditVenueController", function ($scope, $log, nucleus, $state, $http, $q, toastr, uibHelper, venue, edit, uiGmapGoogleMapApi) {

    $log.debug("addEditVenueController starting");
    $scope.$parent.ui.pageTitle = edit ? "Edit Venue" : "Add New Venue";
    $scope.$parent.ui.panelHeading = venue ? venue.name : "";

    $scope.edit = edit;
    $scope.yelp = {};
    $scope.venue = venue || {showInMobileAppMap: true, address: {}, photos: []};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.confirm = { checked: false };
    $scope.setForm = function (form) { $scope.form = form; };
    uiGmapGoogleMapApi.then( function (maps) { $scope.maps = maps; });

    $scope.geolocation = "";

    $scope.media = {
        logo: null,
        photos: [ null, null, null ]
    };

    $scope.parameters = {
        term: "",
        location: "",
        limit: 8
    };
    $scope.results = {};

    // initialize location to prepopulate location field
    $scope.initializeLocation = function() {
        if (!edit ) {
            if ($scope.geolocation)
                $scope.parameters.location = $scope.geolocation;
            else if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    var latLong = position.coords.latitude.toString() + "," + position.coords.longitude.toString();
                    $http.get('venue/yelpSearch', {params: {term: "food", ll: latLong, limit: 1}, timeout: 2000})
                        .then(function (data) {
                            var loc = data.data.businesses[0].location;
                            $scope.geolocation = $scope.parameters.location = loc.city + ", " + loc.state_code;
                        })
                        .catch(function (error) {
                            toastr.error("Try again later", "Location Unavailable");
                        })
                })
            }
            else {
                toastr.error("Your browser doesn't support geolocation", "Location Unavailable");
            }
        }
    };


    $scope.submit = function () {
        var promise;

        if ($scope.media.logo) {
            promise = nucleus.uploadMedia($scope.media.logo)
                .then( function(data) {
                    $scope.venue.logo = data.id;
                })
        }
        else {
            promise = $q(function (resolve, reject) {
                resolve();
            });
        }
        $scope.media.photos.forEach( function (img, index) {
            if (img) {
                promise = promise.then( function() {
                    return nucleus.uploadMedia(img)
                        .then( function(data) {
                            $scope.venue.photos[index] = data.id;
                        })
                })
            }
        })

        if ($scope.edit) {
            promise = promise.then( function() {
                nucleus.updateVenue($scope.venue.id, $scope.venue)
                    .then(function (v) {
                        toastr.success("Venue info updated", "Success!");
                        $state.go('venue.view', {id: v.id});
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Damn!");
                    });
            })
        }
        else {
            promise = promise.then( function() {
                nucleus.addVenue($scope.venue)
                    .then(function (v) {
                        toastr.success("Venue created", "Success!")
                        $state.go('venue.view', {id: v.id});
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Error")
                    })
            })
        }

    };

    $scope.getResults = function () {
        return $http.get('/venue/yelpSearch', {params: $scope.parameters, timeout: 2000})
            .then(function (data) {
                return data.data.businesses;
            })
    };

    $scope.selected = function ($item, $model) {
        $scope.venue.name = $model.name;
        $scope.venue.address = {
            street: $model.location.address[0],
            street2: $model.location.address[1],
            city: $model.location.city,
            state: $model.location.state_code,
            zip: $model.location.postal_code
        };
        $scope.venue.geolocation = {
            latitude: $model.location.coordinate.latitude,
            longitude: $model.location.coordinate.longitude
        };
        $scope.venue.yelpId = $model.id;
    };
    
    $scope.deleteVenue = function () {

        uibHelper.confirmModal("Delete Venue?", "Are you sure you want to delete " + $scope.venue.name + "?", true)
        .then( function (confirmed) {
                if (confirmed) {
                    nucleus.deleteVenue($scope.venue.id)
                        .then(function () {
                            toastr.success("It's gone!", "Venue Deleted");
                            $state.go('venue.list')
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Venue");
                        })
                }
            })
    }
})

app.controller('listVenueController', function ( $scope, venues, $log ) {

    $log.debug("loading listVenueController");
    $scope.$parent.ui.pageTitle = "Venue List";
    $scope.$parent.ui.panelHeading = "";
    $scope.venues = venues;
    
})

app.controller( 'viewVenueController', function ( $scope, venue, $log, uiGmapGoogleMapApi, nucleus ) {
    
    $scope.venue = venue;
    $scope.$parent.ui.pageTitle = "Venue Overview";
    $scope.$parent.ui.panelHeading = venue.name;

    $scope.map = {
        center: {
            latitude: 37.2871407,
            longitude: -121.9430289
        },
        zoom: 18,
        address: addressify(venue.address),
        markerId: 0
    };

    uiGmapGoogleMapApi.then( function (maps) {
        $scope.maps = maps;

        if (venue.geolocation && venue.geolocation.latitude && venue.geolocation.longitude) {
            $scope.map.center.latitude = venue.geolocation.latitude;
            $scope.map.center.longitude = venue.geolocation.longitude;
        }
        else {
            var geocode = new maps.Geocoder();
            geocode.geocode({
                address: $scope.map.address
            }, function(res, stat) {
                $scope.venue.geolocation = {
                    latitude: $scope.map.center.latitude = res[0].geometry.location.lat(),
                    longitude: $scope.map.center.longitude = res[0].geometry.location.lng()
                };
                nucleus.updateVenue($scope.venue.id, $scope.venue)
                    .then( function() {
                        $log.debug("Venue updated with lat/long");
                    })
            })
        }
    })

})