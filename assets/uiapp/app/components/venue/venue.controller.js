/**
 * Created by rhartzell on 5/24/16.
 */

app.filter('trustAsResourceUrl', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
});

addressify = function (address) {
    var newAddr = address.street + ' ';
    newAddr += address.city + ' ';
    newAddr += address.state;
    return newAddr;
};

app.controller("addEditVenueController", function ($scope, $log, nucleus, $state, $http, $q, toastr, uibHelper, venue, edit) {

    $log.debug("addEditVenueController starting");
    $scope.$parent.ui.pageTitle = edit ? "Edit Venue" : "Add New Venue";
    $scope.$parent.ui.panelHeading = venue ? venue.name : "";

    $scope.edit = edit;
    $scope.yelp = {};
    $scope.venue = venue || {showInMobileAppMap: true, address: {}, photos: []};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.confirm = { checked: false };
    $scope.setForm = function (form) {
        $scope.form = form;
    }

    $scope.imgUrls = {
        logo: null,
        photos: [ null, null, null]
    }
    $scope.media = {
        logo: null,
        photos: [ null, null, null ]
    }

    $scope.parameters = {
        term: "",
        location: "",
        limit: 8
    };
    $scope.results = {};

    if (edit) {
        $scope.imgUrls.logo = venue.logoId;
        venue.photos.forEach(function (img, index, array) {
            $scope.imgUrls.photos[index] = img;
        })
    }

    $scope.initializeLocation = function () {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latLong = position.coords.latitude.toString() + "," + position.coords.longitude.toString();
                $http.get('venue/yelpSearch', {params: {term: "food", ll: latLong, limit: 1}, timeout: 2000})
                    .then(function (data) {
                        var loc = data.data.businesses[0].location;
                        $scope.parameters.location = loc.city + ", " + loc.state_code;
                    })
            })
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
                            if ($scope.edit)
                                $scope.venue.photos[index] = data.id;
                            else
                                $scope.venue.photos.push(data.id);
                        })
                })
            }
        })

        if ($scope.edit) {
            promise = promise.then( function() {
                nucleus.updateVenue($scope.venue.id, $scope.venue)
                    .then(function (d) {
                        toastr.success("Venue info updated", "Success!");
                        $state.go('venue.view', {id: d.id});
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Damn!");
                    });
            })
        }
        else {
            promise = promise.then( function() {
                nucleus.addVenue($scope.venue)
                    .then(function () {
                        toastr.success("Venue created", "Success!")
                        $state.go('venue.list');
                    })
                    .catch(function (err) {
                        toastr.error("Something went wrong", "Error")
                    })
            })

        }
       
    };

    $scope.getResults = function () {
        return $http.get('venue/yelpSearch', {params: $scope.parameters, timeout: 2000})
            .then(function (data) {
                return data.data.businesses;
            })
    };

    $scope.selected = function ($item, $model) {
        $scope.venue.name = $model.name;
        $scope.venue.address.street = $model.location.address[0];
        $scope.venue.address.street2 = "" || $model.location.address[1];
        $scope.venue.address.city = $model.location.city;
        $scope.venue.address.state = $model.location.state_code;
        $scope.venue.address.zip = $model.location.postal_code;
        $scope.venue.geolocation = {
            latitude: $model.location.coordinate.latitude,
            longitude: $model.location.coordinate.longitude
        };
        $scope.venue.yelpId = $model.id;
    };
    
    $scope.deleteVenue = function () {

        uibHelper.confirmModal("Delete Venue?", "Are you sure you want to delete " + $scope.venue.name + "?", true)
        .then(function (confirmed) {
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
            },
            function (reason) {
                $scope.confirm.checked = false;
            })
    }
})

app.controller('listVenueController', function ( $scope, venues, $log ) {

    $log.debug("loading listVenueController");
    $scope.$parent.ui.pageTitle = "Venue List";
    $scope.$parent.ui.panelHeading = "";

    $scope.venues = venues;
        
})

app.controller( 'viewVenueController', function ( $scope, venue, $log) {

    var mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.venue = venue;
    $scope.$parent.ui.pageTitle = "Venue Overview";
    $scope.showMap = true;
    $scope.$parent.ui.panelHeading = venue.name;
    $scope.mapLink = mapURL + window.encodeURIComponent(addressify(venue.address));
    
} )