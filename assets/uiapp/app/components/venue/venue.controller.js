/**
 * Created by rhartzell on 5/24/16.
 */

app.filter('trustAsResourceUrl', function($sce) {
    return function(val) {
        return $sce.trustAsResourceUrl(val);
    };
});

app.controller("editVenueAdminController", function($scope, $log, $sce, venue, toastr, nucleus) {

    $log.debug("editVenueAdminController starting");

    mapURL = "https://www.google.com/maps/embed/v1/place?key=AIzaSyCrbE5uwJxaBdT7bXTGpes3F3VmQ5K9nXE&q=";
    $scope.regex = "\\d{5}([\\-]\\d{4})?";
    $scope.venue = venue;
    $scope.localVenue = { address: venue.address, name: venue.name};
    $scope.showMap = true;

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
})