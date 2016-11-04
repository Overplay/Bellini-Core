/**
 * Created by ryanhartzell on 11/3/16.
 */

app.controller('bestPositionListController', function ($scope, $state, nucleus, $log, links, models, $anchorScroll, $location) {
    $log.debug("bestPositionListController");
    $scope.$parent.ui.pageTitle = "Best Position Models";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.models = models;
    $scope.pageSize = 50;
    $scope.currentPage = 1;

    //$log.log(models[0])

    $scope.goToTableTop = function () {
        $location.hash('top');
        $anchorScroll();
    }

})


app.controller('bestPositionEditController', function ($scope, $state, nucleus, $log, links, model, $http) {
    $log.debug("bestPositionEditController");
    $scope.$parent.ui.pageTitle = "Edit Best Position";
    $scope.$parent.ui.panelHeading = "";
    $scope.$parent.links = links;

    $scope.adPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
    $scope.crawlerPositions = ['bottom', 'top']

    $scope.model = model;
    $log.log(model)
    $scope.update = function() {
        $log.log("UPDATE")

        //TODO url 
        $http.put("http://localhost:1338/bestPosition/" + $scope.model.id, $scope.model)
            .then(function(l){
                $log.log(l)
            })
    }
})