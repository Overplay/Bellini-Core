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


app.controller("adDashController", function($scope, $log, ads, logsToday, logsYesterday, weekly){
    $log.log("starting adDashController")
    $scope.$parent.selected = "advertiser"

    $scope.logsToday = logsToday
    $scope.logsYesterday = logsYesterday
    //TODO potentially return 0s with all ads without logs so graph still shows
    

    $scope.keys = _.union(_.keys($scope.logsYesterday), _.keys($scope.logsToday))


    $scope.logs = {}
    _.forEach($scope.keys, function(key){
        $scope.logs[key] = [$scope.logsYesterday[key] || [], $scope.logsToday[key] || []]
    })



    $scope.barOptions = {
        scales: {
            yAxes: [
                {
                    display: true,
                    ticks: {
                        beginAtZero: true,
                        //TODO handle small scales (all zeroes)
                    }
                }
            ],
            xAxes: [{
                barPercentage: .4
            }]
        }
    }

    //TODO show graph if any ads exist, even with [0,0] impressions ?
    //TODO link the bars to the more info of ad? 

    //bar for top 10 performing ads?
    $scope.barLabels = _.keys($scope.logs);
    if(!$scope.barLabels.length)
        $scope.barLabels = ["No Data"]

    //this week vs last week
    $scope.barSeries = ["Yesterday's Impressions","Today's Impressions"];

    //impression count for now? 
    $scope.barData = [
        _.map($scope.logs, function(val){
            return val[0].length
        }),
        _.map($scope.logs, function(val){
            return val[1].length
        })
    ];

    if (!$scope.barData[0].length && !$scope.barData[1].length) {
        $scope.barData[0] = [0]
        $scope.barData[1] = [0]
    }
    
    $scope.weeklyData = [weekly]



    var day = moment().subtract(7, 'days')
    $scope.weeklyLabels = _.times(6, function(num){
        return day.add(1, 'days').format('dddd')
    })
    $scope.weeklyLabels[6] = "Today"


    $scope.weeklyOptions = {
        elements: { line: {tension: 0 } },

    }
    $scope.weeklySeries = ["Total Impressions"]


    var a = angular.copy(ads)

    $scope.advertisements = []
    while (a.length) {
        $scope.advertisements.push(a.splice(0,2))
    }

});



