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
app.controller("manageAdvertisementController", function ($scope, $log, $http, toastr, ads, links, admin) {
    $log.debug("manageAdvertisementController starting");

    $scope.$parent.ui.pageTitle = admin ? "All Advertisements" : "Manage My Advertisements";
    $scope.$parent.ui.panelHeading = '';
    $scope.$parent.links = links;
    $scope.sort = '';
    $scope.reverse = true;

    $scope.toggleSort = function (sortBy) {
        $scope.reverse = !$scope.reverse;
        $scope.sort = sortBy
    }

    //bulk accept reject? could be dangerous but might be nice

    $scope.advertisements = ads;

    $scope.admin = admin

    $scope.pause = function (advertisement) {
        var paused = advertisement.paused;

        var successMessage = paused ? "Advertisement will appear in venues!" : "Advertisement will no longer be placed in venues"

        $http.post('ad/pauseOrResume/', {id: advertisement.id, ad: advertisement})
            .then(function (data) {
                advertisement = data.data;
                _.find($scope.advertisements, {'id': advertisement.id}).paused = advertisement.paused
                toastr.success(successMessage, "Success!");

            })

    }

});


app.controller("editAdvertisementController", function ($scope, $log, $http, $stateParams, $state, toastr, asahiService, links, advertisement, uibHelper, admin, impressions, logs) {
    $log.debug("editAdvertisementController starting");
    $scope.advertisement = advertisement;

    $scope.datePopup = {opened: false}
    $scope.open = function () {
        $scope.datePopup.opened = true;
    }
    $scope.dt = {date: new Date()};


    $scope.format = 'shortDate'
    $scope.dateOptions = {maxDate: new Date()}
    $scope.logs = logs;
    //todo arrows?
    $scope.newDate = function () {
        $log.log("New DATE! ", moment($scope.dt.date).format("YYYY-MM-DD"))
        //request new info for graph
        var d = moment($scope.dt.date).format("YYYY-MM-DD")
        $http.get("/ad/dailyCount?date=" + d + "&id=" + $stateParams.id)
            .then(function (logs) {
                $scope.logs = logs.data;
                $scope.initGraph()
            })
    }

    $scope.initGraph = function () {

        $scope.allHours = {
            0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: [],
            9: [], 10: [], 11: [], 12: [], 13: [], 14: [], 15: [], 16: [], 17: [], 18: [], 19: [], 20: [],
            21: [], 22: [], 23: []
        }


        $scope.hourly = _.merge($scope.allHours, _.groupBy($scope.logs[$scope.advertisement.name], function (log) {
            //$log.log(moment())
            return new Date(log.loggedAt).getHours()

        }));

        //$log.log($scope.hourly)
        ////TODO ad comparisons by hour? change date, show all hours of the day?
        /*$scope.labels = _.map(_.keys($scope.hourly), function(hours){
         var suffix = hours > 11 ? 'pm' : 'am'
         hours = (hours) % 12
         if (hours == 0) hours = 12;
         return hours + suffix //TODO make sure this works lol
         }); //hours
         */
        $scope.labels = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm']
        /*
         var suffix = hours > 11 ? 'pm' : 'am'
         hours = (hours) % 12
         if (hours == 0) hours = 12;
         return hours + suffix //TODO make sure this works lol
         */
        //$log.log($scope.labels)

        //this week vs last week
        $scope.series = ['Hourly Impressions'];

        $scope.graphdata = [ //TODO fill in the gaps?
            _.map(_.toArray($scope.hourly), function (val) {
                return val.length
            })
        ];
        //if (!$scope.graphdata[0].length)
        //   $scope.graphdata = [[0, 0, 0]] //zeroes across the board!
        //$log.log($scope.graphdata)

    }
    $scope.initGraph();


    $scope.impressions = impressions;

    $scope.venues = _.toArray(_.groupBy($scope.impressions, function (el) {
        return el.venue.name;
    })) //TODO maybe backend analytics (seperate by date and counts? )


    //take the current date, split up the times and groupby function to round hours! ?


    $scope.options = {
        scales: {
            yAxes: [
                {
                    display: true,
                    ticks: {
                        stepSize: 1,
                        beginAtZero: true //UGH
                    }


                }
            ],
            /*xAxes: [{
             barPercentage: .4
             }]*/
        }
    }


    //TODO sort by hours shown?


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
        impressions: $scope.logs.length,
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
        $http.get('ad/exportExcel', {params: {id: advertisement.id}, responseType: "arraybuffer"})
            .then(function (res) {
                var blob = new Blob([res.data], {type: res.headers['Content-Type']});
                saveAs(blob, advertisement.name + ".xlsx");
            })
            .catch(function (err) {
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
                $http.post('ad/setDelete/', {
                        id: $scope.advertisement.id,
                        ad: $scope.advertisement,
                        delete: !$scope.advertisement.deleted
                    })
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
    $scope.mediaSizes = ['widget', 'crawler']

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
                $http.post('ad/setDelete/', {
                        id: $scope.advertisement.id,
                        ad: $scope.advertisement,
                        delete: !$scope.advertisement.deleted
                    })
                    .then(function (data) {
                        $scope.advertisement = data.data;
                        $scope.toggleDelete = $scope.advertisement.deleted ? "Re-Enable" : 'Delete'
                    })
            })
    }

    //TODO ad placement? maybe on venue view?
    //maybe a totally separated view that allows placing ads to venues

})