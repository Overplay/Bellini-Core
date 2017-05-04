/*********************************

 File:       roledash.controller.com.js
 Function:   All the Role Dashboards except admin
 Copyright:  Overplay TV
 Date:       5/3/17 8:41 PM
 Author:     mkahn

 Enter detailed description

 **********************************/

app.controller('ownerDashController', function($scope, $log, myVenues ){

    $log.debug("loading ownerDashController");

    $scope.venues = myVenues;

});