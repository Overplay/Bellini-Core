/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http, user, uibHelper, links) {

    $log.debug("addDeviceController starting.");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.device = {};
    $scope.code = false;

    $http.get("api/v1/user/" + user.id) //nucleus.getMe doesn't populate ownedVenues (probably because of waterlock)
        .then(function(u){
            $scope.user = u.data;
        });


    $scope.testDevice = function () {
        //create a device for testing purposes! 
        $http.post('/device/testDevice', $scope.device)
            .then(function (dev) {
                toastr.success("test device: " + dev.name + " created successfully", "Yay!")
                $state.go("device.list")
            })
            .catch(function (err) {
                toastr.error("Test Device not created: " + err, "Damn!");
            });
    };

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


app.controller("addDeviceAdminController", function ($scope, $state, $log, toastr, nucleus, $http, venues, uibHelper, links) {

    $log.debug("addDeviceController starting.");
    $scope.$parent.ui.pageTitle = "Activate Device";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.device = {};
    $scope.code = false;
    $scope.venues = venues;

    $scope.testDevice = function () {
        //create a device for testing purposes!
        $http.post('/device/testDevice', $scope.device)
            .then(function (data) {
                toastr.success("test device: " + data.data.name + " created successfully", "Yay!")
                //TODO redirect
                $state.go("device.adminList")
            })
            .catch(function (err) {
                toastr.error("Test Device not created: " + err, "Damn!");
            });
    };

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

app.controller("editDeviceAdminController", function ($scope, $state, $log, device, toastr, uibHelper, nucleus, venues, $http, links) {
    $log.debug("editDeviceAdminController starting");

    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.$parent.ui.pageTitle = "Manage Device";
    $scope.$parent.ui.panelHeading = device.name || "Device";
    $scope.$parent.links = links;
    $scope.venues = venues;
    $scope.setForm = function (form) {
        $scope.form = form;
    };

    $scope.update = function () {
        //post to an update with $scope.device
        //TODO refactor this
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
    //TODO test
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel

                    //$log.log("ugh")
                    //TODO 
                    $http.delete("api/v1/device/" + $scope.device.id) //todo make sure malicious user doesn't change device id in scope and click delete
                        .then(function () {
                            //$log.log("wut")
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('device.adminList');
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })

                }
                else
                    $log.log("WOWWWW")
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

app.controller("editDeviceOwnerController", function ($scope, $state, $log, device, toastr, uibHelper, nucleus, user, $http, links) {
    $log.debug("editDeviceOwnerController starting");

    $scope.device = device;
    $scope.deviceName = device.name;
    $scope.$parent.ui.pageTitle = "Manage Device";
    $scope.$parent.ui.panelHeading = device.name || "Device";
    $scope.$parent.links = links;
    $scope.confirm = {checked: false};
    $scope.setForm = function (form) {
        $scope.form = form;
    };

    $http.get("api/v1/user/" + user.id) //nucleus.getMe doesn't populate ownedVenues (nucleus uses and auth endpoint in getMe)
        .then(function(u){
            $scope.user = u.data;
        });

    $scope.update = function () {
        //post to an update with $scope.device
        //TODO refactor this
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
    //TODO test
    $scope.deleteDevice = function () {

        uibHelper.confirmModal("Delete Device?", "Are you sure you want to delete device " + $scope.device.name, true)
            .then(function (confirmed) {
                if (confirmed) { // probably not necessary since reject should be called for cancel

                    //$log.log("ugh")
                    //TODO
                    $http.delete("api/v1/device/" + $scope.device.id) //todo make sure malicious user doesn't change device id in scope and click delete
                        .then(function () {
                            //$log.log("wut")
                            toastr.success("It's gone!", "Device Deleted");
                            $state.go('device.list')
                        })
                        .catch(function (err) {
                            toastr.error(err.status, "Problem Deleting Device");
                        })

                }
                else
                    $log.log("WOWWWW")
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

app.controller('listDeviceController', function ($scope, devices, $log, uibHelper, $http, admin, links) {

    $log.debug("loading listDeviceController" + devices);
    $scope.$parent.ui.pageTitle = "Device List";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;
    $scope.admin = admin;
    $scope.devices = devices;

    if (!admin) { //TODO test
        _.forEach($scope.devices, function (dev) {
            $http.get("api/v1/venue/" + dev.venue)
                .then(function (data) {
                    dev.venue = data.data;
                })
    }
    )
}

})