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


app.controller("adminManageDevicesController", function ($scope, $state, $log, userDevices, $sce) {

    $log.debug("adminManageDevicesController starting");

    $log.log(userDevices)
    
    $scope.devices = userDevices; //TODO only get registered devices....(will be easier with final reg)
    //ideas - check by something that is only set once the device is registered (MAC? updated at? ) 
    //TODO get user devices based on location or whatever - not just by owner?
    //order devices?

    $scope.address = $sce.trustAsHtml('<p>{{device.venue.address.street}}</p><p>{{device.venue.address.city}}, {{device.venue.address.state}} {{device.venue.address.zip}}</p>');
});