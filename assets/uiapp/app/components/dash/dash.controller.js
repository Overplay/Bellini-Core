/**
 * Created by cole on 7/15/16.
 */




app.controller("dashController", function ($scope, $log, user, $state) {
    $log.log("starting dashController")

    $log.log(user)
    
    $scope.roles = user.roleTypes;

    $scope.humanize = function(role){
        var sub = role.split('.');
        if (sub[1])
            return sub[1];
        else return role;
    }


    $state.go("dash." +$scope.roles[0].replace('.', ''))

    //TODO default dash view? change button style?
    //highlight current view button
    

});

app.controller("poDashController", function ($scope, $log, $state, venues) {
    $log.log("starting poDashController")

    $scope.venueList = angular.copy(venues);

    var v = angular.copy(venues);

    $scope.venues = []
    while (v.length) {
        $scope.venues.push(v.splice(0,2))
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


app.controller("adDashController", function($scope, $log, ads){
    $log.log("starting adDashController")

    var a = angular.copy(ads)

    //todo handle images for dash
    $scope.advertisements = []
    while (a.length) {
        $scope.advertisements.push(a.splice(0,2))
    }

});



