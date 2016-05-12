/**
 * Created by mkahn on 4/8/16.
 */

app.controller("adminManageUsersController", function($scope, userAuths, $state, $log){

    $log.debug("adminManageUsersController starting");
    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;


});

app.controller( "adminEditUserController", function ( $scope, userAuths, $state ) {

    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;

} );


app.controller("adminManageDevicesController", function ($scope, $state, $log, userDevices) {

    $log.debug("adminManageDevicesController starting");
    $scope.devices = _.filter(userDevices, function (d) { //TODO filter devices based on if they are registered 
        return d.regCode == '';
    });
    //TODO get user devices based on location or whatever 
    $log.log(userDevices)

});