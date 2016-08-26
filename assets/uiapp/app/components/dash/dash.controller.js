/**
 * Created by cole on 7/15/16.
 */




app.controller("dashController", function ($scope, $log, user, $state) {
    $log.log("starting dashController")

    // $log.log(user)
    
    $scope.roles = user.roleTypes;

    $scope.humanize = function(role){
        var sub = role.split('.');
        if (sub[1])
            return sub[1];
        else return role;
    }


    $scope.selected = $scope.roles[0]

    $log.log($scope.selected)


    $state.go("dash." +$scope.roles[0].replace('.', ''))

    //TODO default dash view? change button style?
    //highlight current view button


});

app.controller("poDashController", function ($scope, $log, $state, venues) {
    $log.log("starting poDashController")

    $scope.$parent.selected = "proprietor.owner"

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
    $scope.$parent.selected = "proprietor.manager"

});


app.controller("userDashController", function($scope, $log){
    $log.log("starting userDashController")
    $scope.$parent.selected = "user"


});

app.controller("adminDashController", function ($scope, $log, ads, userCount, deviceCount, adCount) {
    $log.log("starting adminDashController")
    $scope.$parent.selected = "admin"
    $scope.userCount = userCount;
    $scope.deviceCount = deviceCount;
    $scope.adCount = adCount;

    $scope.ads = ads 

});


app.controller("adDashController", function($scope, $log, ads){
    $log.log("starting adDashController")
    $scope.$parent.selected = "advertiser"


    //bar for top 10 performing ads?
    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];

    //this week vs last week
    $scope.series = ['Series A', 'Series B'];

    //impression count for now? 
    $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];


    var a = angular.copy(ads)

    //todo handle images for dash
    $scope.advertisements = []
    while (a.length) {
        $scope.advertisements.push(a.splice(0,2))
    }

});



