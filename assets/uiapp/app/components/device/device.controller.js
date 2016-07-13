/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http, user, uibHelper) {

    $log.debug("addDeviceController starting.");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.device = {};
    $scope.user = user;
    $scope.code = false;

    nucleus.getUserVenues($scope.user.id).then(function (venues) {
        $scope.user.venues = venues;
    });

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

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
        + venue.address.street + ' '
        + venue.address.city + ', '
        + venue.address.state + ')';
    }


});

app.controller("editDeviceAdminController", function ($scope, $state, $log, device, toastr, uibHelper, nucleus) {
    $log.debug("manageDeviceController starting");

    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.$parent.ui.pageTitle = "Manage Device";
    $scope.$parent.ui.panelHeading = device.name || "Device";
    $scope.confirm = {checked: false};
    $scope.owner = device.deviceOwner;
    $scope.setForm = function (form) { $scope.form = form; };
    
    nucleus.getUserVenues($scope.owner.id).then(function (venues) {
        $scope.owner.venues = venues;
    });

    // $log.log(device);
    
    $scope.update = function () {
        //post to an update with $scope.device
        nucleus.updateDevice($scope.device.id, $scope.device)
            .then(function (d) {
                toastr.success("Device info updated", "Success!");
                $scope.$parent.ui.panelHeading = d.name;
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

                    nucleus.deleteDevice($scope.device.id)
                        .then(function () {
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('device.list')
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })
                }
            })
    }

    $scope.listAddress = function (venue) {

        return venue.name + ' ('
        + venue.address.street + ' '
        + venue.address.city + ', '
        + venue.address.state + ')';
    }

    $scope.addressString = function (address) {
        return address.street + ' '
        + address.city + ', '
        + address.state + ' '
        + address.zip;
    }

});

app.controller('listDeviceController', function ( $scope, devices, $log, uibHelper, nucleus ) {

    $log.debug("loading listDeviceController");
    $scope.$parent.ui.pageTitle = "Device List";
    $scope.$parent.ui.panelHeading = "";
    $scope.devices = _.union(_.filter(devices.owned, {regCode: ''}), _.filter(devices.managed, {regCode: ''}));

    _.forEach($scope.devices, function (dev) {
        nucleus.getVenue(dev.venue)
            .then(function (data) {
                dev.venue = data;
            })
    })
})