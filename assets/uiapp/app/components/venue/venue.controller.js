/**
 * Created by rhartzell on 5/24/16.
 */

app.filter('trustAsResourceUrl', function ($sce) {
    return function (val) {
        return $sce.trustAsResourceUrl(val);
    };
});

app.controller("editVenueAdminController", function ($scope, $http, $state, $log, $sce, venue, toastr, nucleus, uibHelper) {

    $log.debug("editVenueAdminController starting");

    var mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.venue = venue;
    $scope.updateVenue = JSON.parse(JSON.stringify(venue));
    $scope.showMap = true;
    $scope.confirm = {checked: false};
    $scope.states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
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

    addressify = function (address) {
        var newAddr = address.street + ' ';
        newAddr += address.city + ' ';
        newAddr += address.state;
        return newAddr;
    }

    $scope.mapLink = mapURL + window.encodeURIComponent(addressify(venue.address));

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
    }

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
})

app.controller("addVenueController", function ($scope, $log, nucleus, $state, $http, $q) {

    $log.debug("addVenueController starting");

    $scope.yelp = {};
    $scope.venue = {showInMobileAppMap: true, address: {}};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
        "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

    $scope.parameters = {
        term: "",
        location: "",
        limit: 5
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
        $http.post('venue/addVenue', $scope.venue)
            .then(function () {
                $state.go('admin.manageVenues');
            })
    };

    $scope.getResults = function (val) {
        return $http.get('venue/yelpSearch', {params: $scope.parameters, timeout: 2000})
            .then(function (data) {
                return data.data.businesses;
            })
    };

    $scope.selected = function ($item, $model, $label) {
        $scope.venue.name = $model.name;
        $scope.venue.address.street = $model.location.address[0];
        $scope.venue.address.street2 = "" || $model.location.address[1];
        $scope.venue.address.city = $model.location.city;
        $scope.venue.address.state = $model.location.state_code;
        $scope.venue.address.zip = $model.location.postal_code;
        $scope.venue.yelpId = $model.id;
    };
})