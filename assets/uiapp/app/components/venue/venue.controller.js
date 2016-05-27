/**
 * Created by rhartzell on 5/24/16.
 */

app.filter('trustAsResourceUrl', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
});

app.controller("editVenueAdminController", function($scope, $state, $log, $sce, venue, toastr, nucleus, uibHelper) {

    $log.debug("editVenueAdminController starting");

    var mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.venue = venue;
    $scope.localVenue = { address: venue.address, name: venue.name};
    $scope.showMap = true;
    $scope.confirm = {checked: false};
    $scope.states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                     "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                     "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                     "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                     "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

    addressify = function(address) {
        var newAddr = address.street + ' ';
        newAddr += address.city + ' ';
        newAddr += address.state;
        return newAddr;
    }

    $scope.mapLink = mapURL + window.encodeURIComponent(addressify(venue.address));

    $scope.update = function () {
        nucleus.updateVenue($scope.venue.id, $scope.venue)
            .then(function (d) {
                toastr.success("Venue info updated", "Success!");
                $scope.localVenue.name = d.name;
                $scope.localVenue.address = d.address;
                $scope.mapLink = mapURL + window.encodeURIComponent(addressify(venue.address));
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

app.controller("addVenueController", function($scope, $log, nucleus, $state, $http) {

    $log.debug("addVenueController starting");

    $scope.venue = {showInMobileAppMap: false};
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
                     "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
                     "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
                     "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
                     "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"];

    $scope.submit = function() {
        $http.post('venue/addVenue', $scope.venue)
            .then(function() {
                $state.go('admin.manageVenues');
            })

    }
})