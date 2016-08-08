/**
 * Created by cgrigsby on 5/27/16.
 * FILENAME DUE TO ADBLOCK
 */


app.controller("addAdvertisementController", function ($scope, $log, $http, $state, user, asahiService, links, toastr) {
    $log.debug("addAdvertisementController starting");

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

        chain.then(function () {
            $log.log($scope.advertisement.media)
            $http.post("/ad/create", $scope.advertisement)
                .then(function () {
                    toastr.success("Advertisement Created and submitted for review!", "Nice!")
                    $state.go("advertisement.list")
                })
        })


    }

});

//list ads for the user 
app.controller("manageAdvertisementController", function ($scope, $log, ads, links, admin) {
    $log.debug("manageAdvertisementController starting");

    $scope.$parent.ui.pageTitle = admin ? "All Advertisements" : "Manage My Advertisements";
    $scope.$parent.ui.panelHeading = '';
    $scope.$parent.links = links;

    $scope.advertisements = ads;

    $scope.admin = admin //TODO search function for ads , also bulk accept/reject?

});


app.controller("editAdvertisementController", function ($scope, $log, $http, $stateParams, toastr, asahiService, links, advertisement, mediaMeta) {
    $log.debug("editAdvertisementController starting");

    $scope.advertisement = advertisement;
    $scope.$parent.ui.panelHeading = $scope.advertisement.name;
    $scope.advertisementUpdate = angular.copy(advertisement);

    $scope.advertisement.mediaMeta = mediaMeta;
    $scope.advertisementUpdate.mediaMeta = angular.copy(mediaMeta);


    $scope.$parent.ui.pageTitle = "Manage Advertisement";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.mediaSizes = ['sm', 'md', 'lg', 'wide']
    
    $scope.media = {
        sm: null,
        md: null,
        lg: null,
        wide: null
    }


    //to update the advertisement 
    $scope.update = function () {
        delete $scope.advertisementUpdate.mediaMeta

        if (!$scope.advertisementUpdate.media) {
            $scope.advertisementUpdate.media = {
                sm: null,
                md: null,
                lg: null,
                wide: null
            }
        }

        var chain = Promise.resolve();
        _.forEach($scope.media, function (val, key) {
            if (val != null) {
                chain = chain.then(function () {
                    return asahiService.uploadMedia(val)
                        .then(function (data) {
                            $scope.advertisementUpdate.media[key] = data.data.id;
                        })
                })
            }

        })

        chain = chain.then(function () {
            return $http.put("api/v1/ad/" + $scope.advertisement.id, $scope.advertisementUpdate)
                .then(function (data) {
                    $scope.advertisement = data.data;
                    $scope.advertisementUpdate = angular.copy(data.data);
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
                    $scope.advertisement.mediaMeta = data.data;
                    $scope.advertisementUpdate.mediaMeta = angular.copy(data.data);
                })
        })


    }
})

app.controller("reviewAdvertisementController", function ($scope, $log, $http, ad, links, toastr) {
    $scope.advertisement = ad
    $scope.$parent.ui.pageTitle = "Review Advertisement";
    $scope.$parent.ui.panelHeading = ad.name;
    $scope.$parent.links = links;
    $scope.mediaSizes = ['sm', 'md', 'lg', 'wide']


    $scope.review = function (acc) {
        $http.post("/ad/review", {id: $scope.advertisement.id, accepted: acc})
            .then(function (a) {
                $scope.advertisement = a.data;
                toastr.success("Advertisement " + (acc ? "accepted!" : "rejected!"), "Success")
            })
    }

    //TODO ad placement? maybe on venue view?
    //maybe a totally separated view that allows placing ads to venues

})