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

app.controller("editVenueAdminController", function ($scope, $http, $state, $log, $sce, venue, toastr, nucleus, uibHelper) {

    $log.debug("editVenueAdminController starting");

    var mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.venue = venue;
    $scope.updateVenue = JSON.parse(JSON.stringify(venue));
    $scope.showMap = true;
    $scope.confirm = { checked: false };
    $scope.states =
        ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
         "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
         "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
         "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
         "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

    if ($scope.venue.yelpId) {
        $http.get('venue/yelpBusiness', {params: {yelpId: $scope.venue.yelpId}, timeout: 1500})
            .then(function (res) {
                $scope.yelpProfile = res.data;
            })
    }
    
    $scope.mapLink = mapURL + window.encodeURIComponent(venue.name + " " + addressify(venue.address));

    $scope.update = function () {
        nucleus.updateVenue($scope.venue.id, $scope.updateVenue)
            .then(function (d) {
                toastr.success("Venue info updated", "Success!");
                $scope.venue = d;
                $scope.updateVenue = JSON.parse(JSON.stringify(d));
                $scope.mapLink = mapURL + window.encodeURIComponent(addressify(d.address));
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    };

    $scope.deleteVenue = function () {

        uibHelper.confirmModal("Delete Venue?", "Are you sure you want to delete " + $scope.venue.name, true)
            .then(function (confirmed) {
                    if (confirmed) {
                        nucleus.deleteVenue($scope.venue.id)
                            .then(function () {
                                toastr.success("It's gone!", "Venue Deleted");
                                $state.go('admin.manageVenues')
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
});

app.controller("addVenueController", function ($scope, $log, nucleus, $state, $http, $q, toastr, uibHelper, venue, edit) {

    $log.debug("addVenueController starting");
    $scope.$parent.ui.pageTitle = "Add New Venue";
    $scope.$parent.ui.panelHeading = venue ? venue.name : "";

    $scope.edit = edit;
    $scope.yelp = {};
    $scope.venue = venue || {showInMobileAppMap: true, address: {}};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.confirm = { checked: false };

    $scope.parameters = {
        term: "",
        location: "",
        limit: 8
    };

    $scope.results = {};

    $scope.initializeLocation = function () {

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var latLong = position.coords.latitude.toString() + "," + position.coords.longitude.toString();
                $http.get('venue/yelpSearch', {params: {term: "food", ll: latLong, limit: 1}, timeout: 2000})
                    .then(function (data) {
                        $scope.parameters.location = data.data.businesses[0].location.city + ", " + data.data.businesses[0].location.state_code;
                    })
            })
        }
    };

    $scope.submit = function () {
        if ($scope.edit) {
            nucleus.updateVenue($scope.venue.id, $scope.venue)
                .then(function (d) {
                    toastr.success("Venue info updated", "Success!");
                    $state.go('venue.view', {id: d.id});
                })
                .catch(function (err) {
                    toastr.error("Something went wrong", "Damn!");
                });
        }
        else {
            $http.post('venue/addVenue', $scope.venue)
                .then(function () {
                    toastr.success("Venue created", "Success!")
                    $state.go('venue.list');
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

        uibHelper.confirmModal("Delete Venue?", "Are you sure you want to delete " + $scope.venue.name, true)
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

app.controller('listVenueController', function ( $scope, venues, $log, $http ) {

    $log.debug("loading listVenueController");
    $scope.$parent.ui.pageTitle = "Venue List";
    //TODO this feels wonky...the page title and the blue bubble should be
    //on the same object. Fix this, Ryan.
    $scope.$parent.ui.panelHeading = "";

    $http.get('/user/getVenues')
        .then(function (data) {
            $scope.venues = data.data;
        })
        .catch(function (err) {
            toastr.error("Problem getting venues", "Somethin' bad happened");
        })
})

app.controller( 'viewVenueController', function ( $scope, venue ) {

    var mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.venue = venue;
    $scope.$parent.ui.pageTitle = "Venue Overview";
    $scope.showMap = true;
    $scope.$parent.ui.panelHeading = venue.name;
    $scope.mapLink = mapURL + window.encodeURIComponent(venue.name + " " + addressify(venue.address));

} )

app.controller( 'editVenueController', function ( $scope, venue ) {

    $scope.$parent.ui.pageTitle = "Venue Edit";
    $scope.$parent.ui.panelHeading = venue.name;
    $scope.updateVenue = venue;

} )