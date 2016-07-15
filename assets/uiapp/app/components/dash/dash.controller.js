/**
 * Created by cole on 7/15/16.
 */




app.controller("dashController", function ($scope, $log, $state) {


    //TODO redirect to appropriate dashboards? 
    $state.go('dash.po')


});

app.controller("poDashController", function ($scope, $log, $state, venues) {

    $scope.venues = []
    while (venues.length) {
        $scope.venues.push(venues.splice(0,2))
    }

    $scope.addressify = function (address) {
        return address.street + ' '
            + address.city + ', '
            + address.state + ' '
            + address.zip
    };
    //address name and logo? also link it
    //background?
    //highlight or enlarge when hover?

});




