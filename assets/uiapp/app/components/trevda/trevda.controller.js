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
        creator: user.id,
        advert: {
            type: '2g3s', //in the future this will be variable and alter the view
            text: ['', '', ''],
            media: {
                widget: null,
                crawler: null
            }
        }

    };


    $scope.media = {
        widget: null,
        crawler: null
    }


    $scope.submit = function () {

        var chain = Promise.resolve();

        _.forEach($scope.media, function (val, key) {
            if (val != null) {
                chain = chain.then(function () {
                    return asahiService.uploadMedia(val)
                        .then(function (data) {
                            $scope.advertisement.advert.media[key] = data.data.id;
                        })
                })
            }

        })

        chain.then(function () {
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
    $scope.sort = '';
    $scope.reverse = true;

    $scope.toggleSort= function(sortBy){
        $scope.reverse = !$scope.reverse;
        $scope.sort = sortBy
    }

    //bulk accept reject? could be dangerous but might be nice

    $scope.advertisements = ads;

    $scope.admin = admin

});


app.controller("editAdvertisementController", function ($scope, $log, $http, $stateParams, $state, toastr, asahiService, links, advertisement, uibHelper, admin, impressions) {
    $log.debug("editAdvertisementController starting");


    $scope.impressions = impressions;

    $scope.venues = _.toArray(_.groupBy($scope.impressions, function (el) {
        return el.venue.name;
    })) //TODO maybe backend analytics (seperate by date and counts? )

    $scope.labels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
    $scope.series = ['Series A', 'Series B'];

    $scope.graphdata = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
    ];

    $scope.advertisement = advertisement;

    $scope.$parent.ui.panelHeading = $scope.advertisement.name;
    $scope.advertisementUpdate = angular.copy(advertisement);
    

    $scope.$parent.ui.pageTitle = "Manage Advertisement";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.mediaSizes = ['widget', 'crawler']
    
    $scope.media = {
        widget: null,
        crawler: null
    }


    $scope.data = {
        impressions: 1004,
        screenTime: 4.5
    }

    //to update the advertisement 
    $scope.update = function () {

        if (!$scope.advertisementUpdate.advert.media) {
            $scope.advertisementUpdate.advert.media = {
                widget: null,
                crawler: null
            }
        }

        var chain = Promise.resolve();
        _.forEach($scope.media, function (val, key) {
            if (val != null) {
                chain = chain.then(function () {
                    return asahiService.uploadMedia(val)
                        .then(function (data) {
                            $scope.advertisementUpdate.advert.media[key] = data.data.id;
                        })
                })
            }

        })

        chain = chain.then(function () {
            return $http.put("ad/editAd", {id: $scope.advertisement.id, ad: $scope.advertisementUpdate})
                .then(function (data) {
                    $scope.advertisement = data.data;
                    $scope.advertisementUpdate = angular.copy(data.data);
                    toastr.success("Advertisement info updated", "Success!");
                })
                .catch(function (err) {
                    toastr.error("Something went wrong", "Damn!");
                })


        });


    }

    $scope.exportExcel = function () {
        $http.get('ad/exportExcel', { params: { id : advertisement.id }, responseType: "arraybuffer" })
            .then( function (res) {
                var blob = new Blob([res.data], { type : res.headers['Content-Type'] });
                saveAs(blob, advertisement.name + ".xlsx");
            })
            .catch( function (err) {
                toastr.error("Something went wrong. Try again later.", "Error!");
            })
    }

    $scope.pause = function () {
        var paused = $scope.advertisement.paused;
        var q = paused ? "Resume" : "Pause" + " Advertisement"
        var e = paused ? "Are you sure you would like to resume to advertisement into venues?"
            : "Are you sure you would like to pause the advertisement from being placed in venues?"


        var successMessage = paused ? "Advertisement will appear in venues!" : "Advertisement will no longer be placed in venues"

        uibHelper.confirmModal(q, e, true)
            .then(function (confirmed) {
                $http.post('ad/pauseOrResume/', {id: $scope.advertisement.id, ad: $scope.advertisement})
                    .then(function (data) {
                        $scope.advertisement = data.data;
                        $scope.advertisementUpdate = angular.copy(data.data);
                        toastr.success(successMessage, "Success!");

                    })
            })

    }

    //tODO document endpoints and policies for them :) 

    $scope.delete = function () {
        uibHelper.confirmModal("Are you sure?", "Would you really like to move this ad to the archives?", true)
            .then(function (confirmed) {
                $http.post('ad/toggleDelete/', {id: $scope.advertisement.id, ad: $scope.advertisement})
                    .then(function (data) {

                        var state = admin ? 'adminList' : 'list'
                        $state.go('advertisement.' + state)
                        toastr.success("Advertisement successfully deleted", "Success!")
                    })
            })
    }
})

app.controller("reviewAdvertisementController", function ($scope, $log, $http, $state, ad, links, toastr, uibHelper) {
    $scope.advertisement = ad
    $scope.$parent.ui.pageTitle = "Review Advertisement";
    $scope.$parent.ui.panelHeading = ad.name;
    $scope.$parent.links = links;
    $scope.mediaSizes = ['widget','crawler']

    $scope.toggleDelete = $scope.advertisement.deleted ? "Re-Enable" : 'Delete'

    $scope.review = function (acc) {
        $http.post("/ad/review", {id: $scope.advertisement.id, accepted: acc})
            .then(function (a) {
                $scope.advertisement = a.data;
                toastr.success("Advertisement " + (acc ? "accepted!" : "rejected!"), "Success")

                $state.go("advertisement.adminList")
            })
    }

    $scope.delete = function () {
        uibHelper.confirmModal("Are you sure?", "Would you really like toggle the status of the ad?", true)
            .then(function (confirmed) {
                $http.post('ad/toggleDelete/', {id: $scope.advertisement.id, ad: $scope.advertisement})
                    .then(function (data) {
                        $scope.advertisement = data.data;
                        $scope.toggleDelete = $scope.advertisement.deleted ? "Re-Enable" : 'Delete'
                    })
            })
    }

    //TODO ad placement? maybe on venue view?
    //maybe a totally separated view that allows placing ads to venues

})