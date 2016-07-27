/**
 * Created by cgrigsby on 5/27/16.
 * FILENAME DUE TO ADBLOCK
 */


app.controller("addAdvertisementController", function ($scope, $log, $http, $state, user, asahiService, links) {
    $log.debug("addAdvertisementController starting");

    //TODO toastrs

    $scope.$parent.ui.pageTitle = "Create An Advertisement";
    $scope.$parent.ui.panelHeading = '';
    $scope.$parent.links = links;

    $scope.advertisement = {
        creator: user, media: {
            sm: null,
            md: null,
            lg: null,
            wide: null
        }
    };

    /*$scope.filesToUpload = [];

    $scope.addFilesToUpload = function(files) {
        var l = files.length;
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
    }

     $scope.$on('droppedFile', function (e, files) {
        var l = files.length;
        //alert(l);
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
     });


    $scope.removeUpload = function (index) {
        $scope.filesToUpload.splice(index, 1)
     };*/


    $scope.media = {
        sm: null,
        md: null,
        lg: null,
        wide: null
    }


    $scope.submit = function () {

        var chain = Promise.resolve();

        _.forEach($scope.media, function (val, key) {
            if (val != null) {
                chain = chain.then(function () {
                    return asahiService.uploadMedia(val)
                        .then(function (data) {
                            $scope.advertisement.media[key] = data.data.id;
                        })
                })
            }

        })



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
            $log.log($scope.advertisement.media)
            $http.post("/ad/create", $scope.advertisement)
                .then(function (a) {
                    $log.log(a)
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

    $scope.media = {
        sm: null,
        md: null,
        lg: null,
        wide: null
    }

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
                    $log.log(data)
                    $scope.advertisement.mediaMeta = data.data;
                    $scope.advertisementUpdate.mediaMeta = data.data;
                    _.forEach($scope.advertisementUpdate.mediaMeta, function (m) {
                        if (m)
                            m.remove = true; //why 
                    })
                })
        });

    //toggle whether to keep or remove the media on update 
    //TODO
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

    /*
    //remove a file that is queued to be uploaded and added to the ad 
    $scope.removeUpload = function (index) {
        $scope.filesToUpload.splice(index, 1)
    };
     */
    

    //dz listener 
    /*$scope.$on('droppedFile', function (e, files) {
        var l = files.length;
        //alert(l);
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
     });*/
    /*
    $scope.addFilesToUpload = function(files) {
        var l = files.length;
        for (var i = 0; i < l; i++) {
            $scope.filesToUpload.push(files[i]);
        }
        $scope.$apply();
     }*/
    

    //to update the advertisement 
    $scope.update = function () {

        var chain = Promise.resolve();
        _.forEach($scope.media, function (val, key) {
            if (val != null) {
                chain = chain.then(function () {
                    return asahiService.uploadMedia(val)
                        .then(function (data) {
                            $scope.advertisement.media[key] = data.data.id;
                        })
                })
            }

        })

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