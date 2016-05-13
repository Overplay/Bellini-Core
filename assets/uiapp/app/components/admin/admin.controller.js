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
    $scope.devices = userDevices; //TODO only get registered devices....
    //ideas - check by something that is only set once the device is registered (MAC?) 
    //TODO get user devices based on location or whatever - not just by owner?
    //order devices?
    //$log.log(userDevices)

});