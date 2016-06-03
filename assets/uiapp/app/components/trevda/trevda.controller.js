/**
 * Created by cgrigsby on 5/27/16.
 */

//FILENAME DUE TO ADBLOCK 

app.controller("addAdvertisementController", function ($scope, $log, $http, $state, user, asahiService) {
    $log.debug("addAdvertisementController starting");

    $scope.advertisement = {creator: user};
    $scope.filesToUpload = [];

    //TODO upload and create media then add it to the add before submitting
    $scope.$on('droppedFile', function (e, files) {
        $log.log("DROPPED");
        var l = files.length;
        //alert(l);
        $scope.filesToUpload = [];
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    });

    $scope.advertisement.marr = [];

    $scope.submit = function () {
        //TODO upload media, get id and add it to ad 

        var chain = Promise.resolve();
        $scope.filesToUpload.forEach(function (file) {
            chain = chain.then(function () {
                return asahiService.uploadMedia(file)
                    .then(function (m) {
                        $scope.advertisement.marr.push(m.data.id);
                    })
            })
        })
        chain.then(function () {
            $http.post("/ad/create", $scope.advertisement)
                .then(function (a) {
                    $state.go("advertisement.manageAdvertisements")
                })
        })


    }

});

app.controller("manageAdvertisementController", function ($scope, $log, user, $http) {
    $log.debug("manageAdvertisementController starting");
    //cant use user.advertisements because media wont be populated ?? TODO test this with media
    $http.get("/user/getAlist").then(function (ads) {
        $scope.advertisements = ads.data;
    })

});

app.controller("editAdvertisementController", function ($scope, $log, $http, $stateParams, toastr) {
    $log.debug("editAdvertisementController starting");


    $http.get("api/v1/ad/" + $stateParams.id)
        .then(function (data) {
            $scope.advertisement = data.data;
            $scope.advertisementUpdate = JSON.parse(JSON.stringify(data.data));
            $log.log($scope.advertisement)
        })
        .then(function () {
            $http.get("ad/getMedia/" + $stateParams.id)
                .then(function (data) {
                    $scope.advertisement.media = data.data;
                    $scope.advertisementUpdate.media = data.data;

                    $log.log(data)
                })
        })

    $scope.removeMedia = function (id) {
        $log.log("remove media", id)
        _.remove($scope.advertisementUpdate.marr, function (i) {
            return id == i;
        })
        _.remove($scope.advertisementUpdate.media, function (m) {
            return id == m.id;
        })
        //TODO require update click? change button?

    }


    //TODO delete and add media! 
    $scope.filesToUpload = [];
    //TODO remove file from files to upload method 


    //TODO upload and create media then add it to the add before submitting
    //TODO allow remove of media from files to upload?
    $scope.$on('droppedFile', function (e, files) {
        $log.log("DROPPED");
        var l = files.length;
        //alert(l);
        $scope.filesToUpload = [];
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    });

    $scope.update = function () {


        var chain = Promise.resolve();
        $scope.filesToUpload.forEach(function (file) {
            chain = chain.then(function () {
                return asahiService.uploadMedia(file)
                    .then(function (m) {
                        $scope.advertisement.marr.push(m.data.id);
                    })
            })
        })
        chain.then(function () {
            delete $scope.advertisement.media;
            $http.put("api/v1/ad/" + $scope.advertisement.id, $scope.advertisementUpdate)
                .then(function (data) {
                    $scope.advertisement = data.data;
                    $scope.advertisementUpdate = JSON.parse(JSON.stringify(data.data));
                    toastr.success("Advertisement info updated", "Success!");
                })
                .catch(function (err) {
                    toastr.error("Something went wrong", "Damn!");
                })


        })

    }
})