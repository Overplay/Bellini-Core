/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http, user, uibHelper) {

    $log.debug("addDeviceController starting.");
    $scope.device = {};
    $scope.user = user;
    $scope.code = false;

    //$scope.device.venue = $scope.user.venue[0];

    $scope.submitForCode = function () {
        $http.post('/activation/generateCode', $scope.device)
            .then(function (data) {
                $scope.code = true;
                $scope.data = data.data;
            })
            .catch(function (err) {
                toastr.error("Device activation code not generated", "Damn!");
            });
    }



});



app.controller("editDeviceAdminController", function ($scope, $state, $log, device, toastr, uibHelper, nucleus) {
    $log.debug("manageDeviceController starting");

    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.confirm = { checked: false };

    // $log.log(device);
    
    $scope.update = function () {
        //post to an update with $scope.device
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then(function (d) {
                toastr.success("Device info updated", "Success!");
                $scope.deviceName = d.name;
                // $state.go('admin.manageDevices')
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    }


    // Cole's code for deleting device
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel

                    nucleus.deleteDevice($scope.device)
                        .then(function () {
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('admin.manageDevices')
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })


                }

            },
            function (reason) {
                $scope.confirm.checked = false;
            })


    }


});