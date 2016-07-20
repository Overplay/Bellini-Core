/**
 * Created by cgrigsby on 5/27/16.
 * FILENAME DUE TO ADBLOCK
 */


app.controller("addAdvertisementController", function ($scope, $log, $http, $state, user, asahiService, links) {
    $log.debug("addAdvertisementController starting");


    $scope.$parent.ui.pageTitle = "Create An Advertisement";
    $scope.$parent.ui.panelHeading = '';
    $scope.$parent.links = links;
    
    $scope.advertisement = {creator: user};
    $scope.filesToUpload = [];

    $scope.addFilesToUpload = function(files) {
        var l = files.length;
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    }

    /*$scope.$on('droppedFile', function (e, files) {
        var l = files.length;
        //alert(l);
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    });*/


    $scope.removeUpload = function (index) {
        $scope.filesToUpload.splice(index, 1)
    };


    $scope.media = {img: null}



    $scope.advertisement.marr = [];

    $scope.submit = function () {

        var chain = Promise.resolve();


        if ($scope.media.img) {

            chain = chain.then(function () {
                return asahiService.uploadMedia($scope.media.img)
                    .then(function (data) {
                        $scope.advertisement.marr.push(data.data.id);
                    })
            })
        }

        /*This is for my old multifile uploads
        $scope.filesToUpload.forEach(function (file) {
            chain = chain.then(function () {
                return asahiService.uploadMedia(file)
                    .then(function (m) {
                        $scope.advertisement.marr.push(m.data.id);
                    })
            })
        })*/
        chain.then(function () {
            $http.post("/ad/create", $scope.advertisement)
                .then(function (a) {
                    $state.go("advertisement.list")
                })
        })


    }

});

//list ads for the user 
app.controller("manageAdvertisementController", function ($scope, $log, ads, links) {
    $log.debug("manageAdvertisementController starting");

    $scope.$parent.ui.pageTitle = "Manage My Advertisements";
    $scope.$parent.ui.panelHeading = '';
    $scope.$parent.links = links;

    $scope.advertisements = ads;

});


app.controller("editAdvertisementController", function ($scope, $log, $http, $stateParams, toastr, asahiService, links) {
    $log.debug("editAdvertisementController starting");

    $scope.$parent.ui.pageTitle = "Manage Advertisement";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.filesToUpload = [];

    $scope.media = {img: null}

    //get the ad and populate media 
    $http.get("api/v1/ad/" + $stateParams.id)
        .then(function (data) {
            $scope.advertisement = data.data;
            $scope.$parent.ui.panelHeading = $scope.advertisement.name;

            $scope.advertisementUpdate = JSON.parse(JSON.stringify(data.data));
        })
        .then(function () {
            $http.get("ad/getMedia/" + $stateParams.id)
                .then(function (data) {
                    $scope.advertisement.media = data.data;
                    $scope.advertisementUpdate.media = data.data;
                    $scope.advertisementUpdate.media.forEach(function (m) {
                        m.remove = true;
                    })
                })
        });

    //toggle whether to keep or remove the media on update 
    $scope.removeMedia = function (id) {
        _.remove($scope.advertisementUpdate.marr, function (i) {
            return id == i;
        });
        eval("media_" + id).classList.add("strike-media")
        _.find($scope.advertisementUpdate.media, function (m) {
            return m.id == id;
        }).remove = false;
    };
    $scope.keepMedia = function (id) {
        $scope.advertisementUpdate.marr.push(id);
        eval("media_" + id).classList.remove("strike-media")
        _.find($scope.advertisementUpdate.media, function (m) {
            return m.id == id;
        }).remove = true;


    };

    //remove a file that is queued to be uploaded and added to the ad 
    $scope.removeUpload = function (index) {
        $scope.filesToUpload.splice(index, 1)
    };


    //dz listener 
    /*$scope.$on('droppedFile', function (e, files) {
        var l = files.length;
        //alert(l);
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    });*/
    $scope.addFilesToUpload = function(files) {
        var l = files.length;
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    }




    $scope.media = {img: ''}

    //to update the advertisement 
    $scope.update = function () {

        var chain = Promise.resolve();

        $log.log($scope.media)

        if ($scope.media.img) {

            chain = chain.then(function () {
                return asahiService.uploadMedia($scope.media.img)
                    .then(function (data) {
                        $scope.advertisementUpdate.marr.push(data.data.id);
                    })
            })
        }
        /* OLD multifile upload
        //upload necesary files
        $scope.filesToUpload.forEach(function (file) {
            chain = chain.then(function () {
                return asahiService.uploadMedia(file)
                    .then(function (m) {
                        $scope.advertisementUpdate.marr.push(m.data.id);
                    })
            })
        });*/
        //update the ad
        chain = chain.then(function () {
            delete $scope.advertisement.media;
            return $http.put("api/v1/ad/" + $scope.advertisement.id, $scope.advertisementUpdate)
                .then(function (data) {
                    $scope.advertisement = data.data;
                    $scope.advertisementUpdate = JSON.parse(JSON.stringify(data.data));
                    toastr.success("Advertisement info updated", "Success!");
                })
                .catch(function (err) {
                    toastr.error("Something went wrong", "Damn!");
                })


        });
        //update the media associated with the ad
        chain = chain.then(function () {
            return $http.get("ad/getMedia/" + $stateParams.id)
                .then(function (data) {
                    $scope.advertisement.media = data.data;
                    $scope.advertisementUpdate.media = data.data;
                    $scope.advertisementUpdate.media.forEach(function (m) {
                        m.remove = true;
                    })
                })
        })
        //clear the files that need to be uploaded
        chain = chain.then(function () {
            $scope.filesToUpload = [];
        })

    }
})