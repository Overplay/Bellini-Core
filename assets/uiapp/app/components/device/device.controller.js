/**
 * Created by rhartzell on 5/13/16.
 */

app.controller('editDeviceController', function($scope, device, $state, $log, nucleus, toastr, uibHelper) {
    
    $log.debug("editDeviceController starting");
    $scope.device = device;
    $scope.deviceName = device.name;
    
    // Cole's code for updating device
    $scope.update = function () {
        //post to an update with $scope.device
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then(function (d) {
                toastr.success("Device info updated", "Success!");
                $scope.deviceName = d.name;
            })
            .catch(function (err) {
                toastr.error("Something went wrong", "Damn!");
            });
    };

    // Cole's code for deleting device
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel
                    nucleus.deleteDevice($scope.device.id)
                        .then(function () {
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('admin.manageUsers');
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })
                }
            })
    }
});