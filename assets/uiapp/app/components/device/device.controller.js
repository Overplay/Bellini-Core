/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http) {

    $log.debug("addDeviceController starting.");
    $scope.device = {};

    $http.post('/activation/generateCode', $scope.device)
        .then(function (data) {
            $scope.data = data.data;
        });


});

//THis controller will be something the device implements, i just created it for
//testing purposes - coal 
app.controller("registerDeviceController", function ($scope, $state, $log, toastr, nucleus, $http) {

    $log.debug("registerDeviceController starting.");
    $scope.device = {};

    $scope.register = function () {
        $log.log($scope.device);
        $http.post('/device/registerDevice', $scope.device)
            .then(function (data) {
                toastr.success("Device Registered!", "Success!");

                $state.go('admin.manageDevices');
            })
            .catch(function (err) {
                toastr.error("Device activation code not found", "Damn!");
                $scope.device.regCode = '';
            });


    };

});