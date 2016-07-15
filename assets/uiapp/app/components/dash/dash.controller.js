/**
 * Created by cole on 7/15/16.
 */




app.controller("dashController", function ($scope, $log, user) {
    $log.log("starting dashController")


    $scope.roles = user.roleTypes;

    $scope.humanize = function(role){
        var sub = role.split('.');
        if (sub[1])
            return sub[1];
        else return role;
    }

    //TODO default dash view? change button style?

});

app.controller("poDashController", function ($scope, $log, $state, venues) {
    $log.log("starting poDashController")

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


app.controller("pmDashController", function($scope, $log){
    $log.log("starting pmDashController")
});


app.controller("userDashController", function($scope, $log){
    $log.log("starting userDashController")

});

app.controller("adminDashController", function($scope, $log){
    $log.log("starting adminDashController")

});


app.controller("adDashController", function($scope, $log){
    $log.log("starting adDashController")

});



