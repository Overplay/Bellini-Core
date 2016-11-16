/**
 * Created by ryanhartzell on 11/3/16.
 */


app.controller('bestPositionListController', function ($scope, $rootScope, $state, $http, nucleus, $log, links, $anchorScroll, $location, toastr) {
    $log.debug("bestPositionListController");
    $scope.loadingData = true;
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.url = $rootScope.url;

    $scope.models = [];
    $scope.pageSize = 50;
    $scope.currentPage = 1;
    $scope.multiEditIds = [];
    //$log.log(models[0])

    $http.get('http://'+$scope.url+':1338/BestPosition/findAll')
        .then( function (data) {
            $scope.models = data.data;
            $scope.loadingData = false;
        })
        .catch( function (err) {
            $scope.loadingData = false;
            toastr.error("Unable to fetch best position models. Please try again later.", "Error");
        });


    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }

    $scope.selectOne = function (id) {
        var index = _.indexOf($scope.multiEditIds, id);
        if (index === -1) {
            $scope.multiEditIds.push(id);
            if ($scope.multiEditIds.length === $scope.results.length)
                $scope.allSelected = true;
        }
        else {
            $scope.multiEditIds.splice(index, 1);
            $scope.allSelected = false;
        }
    }

    $scope.selectAll = function () {
        if ($scope.multiEditIds.length !== $scope.results.length) {
            $scope.multiEditIds = [];
            _.forEach($scope.results, function (o) {
                $scope.multiEditIds.push(o.id);
                o.selected = true;
            });
        }
        else {
            $scope.multiEditIds = [];
            _.forEach($scope.results, function (o) { o.selected = false; })
        }
    }

})

app.controller('bestPositionMultiEditController', function ($scope, $rootScope, $state, nucleus, $log, $http, links, toastr, ids) {
    $log.debug("bestPositionMultiEditController starting");
    $scope.$parent.ui.pageTitle = "Edit Best Position Models";
    $scope.$parent.ui.panelHeading = "Editing " + ids.length + " Models";
    $scope.$parent.links = links;
    var url = $rootScope.url;
    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top'];
    $scope.bestPositions = [];
    $scope.updating = {
        active: false,
        count: 0
    };

    $scope.model = {
        adPosition: "",
        crawlerPosition: ""
    };

    // change states if not a multiedit
    if (ids.length === 1)
        $state.go('bestposition.edit', { id: ids[0]});
    else if (ids.length === 0) {
        toastr.warning("There were no items selected to edit", "No Items!");
        $state.go('bestposition.list');
    }
    else {
        var promises = [];
        _.forEach(ids, function (id) {
            promises.push(
                $http.get("http://" + url + ":1338/bestPosition/" + id)
                    .then(function (bp) {
                        $scope.bestPositions.push(bp.data);
                    })
            )
        });

        Promise.all(promises).then( function () {
            $log.debug("All best position models fetched");
        })
        .catch( function (err) {
            $log.error(err);
        })

    }

    $scope.update = function () {
        if (!$scope.model.adPosition || !$scope.model.crawlerPosition)
            toastr.error("You must select both ad and crawler positions", "Can't Save");
        else {
            var promises = [];
            $scope.updating.active = true;

            _.forEach($scope.bestPositions, function (bp) {
                bp.adPosition = $scope.model.adPosition;
                bp.crawlerPosition = $scope.model.crawlerPosition;
                promises.push(
                    $http.put("http://"+url+":1338/bestPosition/" + bp.id, bp)
                        .then( function (b) {
                            $scope.updating.count++;
                        })
                )
            })

            Promise.all(promises).then( function () {
                $scope.updating.active = false;
                $scope.updating.count = 0;
                toastr.success("Best positions updated", "Success!");
            })
        }
    }
})


app.controller('bestPositionEditController', function ($scope, $rootScope, $state, nucleus, $log, links, model, $http, toastr) {
    $log.debug("bestPositionEditController");
    $scope.model = model;
    var url = $rootScope.url;

    $scope.$parent.ui.pageTitle = "Edit Best Position";
    $scope.$parent.ui.panelHeading = model.type == 'network' ? "Network: " + model.network : "Series: " + model.seriesName;
    $scope.$parent.links = links;

    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top']

    $http.get('/uiapp/local.json').then(function(data){
        url = data.data.url
    })

    $scope.update = function() {
        //TODO url
        $http.put("http://"+url+":1338/bestPosition/" + $scope.model.id, $scope.model)
            .then(function(l){
                $log.log(l)
                toastr.success("Positions updated!", "Nice!")
            })
    }
})