/**
 * Created by mkahn on 4/8/16.
 */

app.controller("adminManageUsersController", function($scope, userAuths, $state, $log){

    $log.debug("adminManageUsersController starting");
    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths; // TODO currently gets all users on the system. should group by org? 
    // who has access? 
    $log.log("All userAuths shown");

});


//not utilized 
app.controller( "adminEditUserController", function ( $scope, userAuths, $state ) {
    $log.debug("adminEditUserController starting");

    $scope.subTitle = $state.current.data.subTitle;
    $scope.users = userAuths;


} );


app.controller("adminManageDevicesController", function ($scope, $state, $log, user, $sce, nucleus, $http) {

    $log.debug("adminManageDevicesController starting");


    //only displays registered devices and combines the two lists
    function combineDevices(a, b) {
        return _.union(_.filter(a, {regCode: ''}), _.filter(b, {regCode: ''}));
    }

    //returns devices.owned and devices.managed
    $http.get('/user/getDevices')
        .then(function (data) {
            var devices = data.data;
            $scope.devices = combineDevices(devices.owned, devices.managed);

            _.forEach($scope.devices, function (dev) {
                $http.get('api/v1/venue/' + dev.venue)
                    .then(function (data) {
                        dev.venue = data.data;
                    })
                    .catch(function (err) {
                        toastr.error("Venue not found", "Damn!");
                    });
            })

        })
        .catch(function (err) {
            toastr.error("Problem getting devices", "Damn! Really not good");
        });


    $scope.address = $sce.trustAsHtml('<p>{{device.venue.address.street}}</p><p>{{device.venue.address.city}}, {{device.venue.address.state}} {{device.venue.address.zip}}</p>');
});