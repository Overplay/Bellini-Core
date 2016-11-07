/**
 * Created by ryanhartzell on 11/3/16.
 */

var url = "localhost";

app.controller('bestPositionListController', function ($scope, $state,$http, nucleus, $log, links, $anchorScroll, $location) {
    $log.debug("bestPositionListController");
    $scope.loadingData = true;
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.models = [];
    $scope.pageSize = 50;
    $scope.currentPage = 1;

    //$log.log(models[0])

    $http.get('http://'+url+':1338/BestPosition/findAll')
        .then( function (data) {
            $scope.models = data.data
            $scope.loadingData = false
        })


    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }

})


app.controller('bestPositionEditController', function ($scope, $state, nucleus, $log, links, model, $http, toastr) {
    $log.debug("bestPositionEditController");
    $scope.model = model;
    $scope.$parent.ui.pageTitle = "Edit Best Position";
    $scope.$parent.ui.panelHeading = model.type == 'network' ? "Network: " + model.network : "Series: " + model.seriesName;
    $scope.$parent.links = links;

    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top']

    $scope.update = function() {
        //TODO url 
        $http.put("http://"+url+":1338/bestPosition/" + $scope.model.id, $scope.model)
            .then(function(l){
                $log.log(l)
                toastr.success("Positions updated!", "Nice!")
            })
    }
})