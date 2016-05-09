/**
 * Created by cgrigsby on 5/9/16.
 */



app.controller("addDeviceController", function ($scope, $state, $log, toastr, nucleus, $http) {

    $log.debug("addDeviceController starting.");
    $scope.device = {};

    $http.post('/activation/generateCode', {})
        .then(function (data) {
            $scope.data = data.data;
        });

    
});